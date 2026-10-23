// Static checks on the SQL migrations. They run without a database and catch structural mistakes (a table without
// RLS, a writable role table, a definer function without a pinned search_path). They do NOT execute the SQL or
// prove the policies behave correctly; that needs a real Postgres/Supabase project (see README: "Integration checks").
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dir = path.join(root, 'supabase/migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const sql = Object.fromEntries(files.map((f) => [f, fs.readFileSync(path.join(dir, f), 'utf8')]));
const all = Object.values(sql).join('\n');
const strip = (s) => s.replace(/--.*$/gm, '');
const code = strip(all);

const tables = [...code.matchAll(/create table public\.(\w+)/g)].map((m) => m[1]);

test('migrations are timestamp-named and in order', () => {
  assert.equal(files.length, 3);
  for (const f of files) assert.match(f, /^\d{14}_[a-z_]+\.sql$/);
});

test('every table is covered by row level security', () => {
  assert.ok(tables.length >= 20, `found ${tables.length} tables`);
  for (const t of tables) assert.match(code, new RegExp(`alter table public\\.${t} enable row level security`), `${t} has no RLS`);
});

test('every table has at least one policy (directly or via the policy loops)', () => {
  const direct = new Set([...code.matchAll(/create policy "[^"]+" on public\.(\w+)/g)].map((m) => m[1]));
  const looped = new Set();
  for (const m of code.matchAll(/foreach t in array array\[([^\]]+)\]\s+loop([\s\S]*?)end loop/g)) {
    if (/create policy/.test(m[2])) for (const n of m[1].matchAll(/'(\w+)'/g)) looped.add(n[1]);
  }
  for (const t of tables) assert.ok(direct.has(t) || looped.has(t), `${t} has no policy, so only the owner could read it`);
});

test('user_roles cannot be written through the API', () => {
  assert.doesNotMatch(code, /create policy[^;]*on public\.user_roles\s+for (insert|update|delete|all)/i);
  assert.doesNotMatch(code, /grant[^;]*(insert|update|delete|all)[^;]*on public\.user_roles/i);
});

test('admin authority comes only from user_roles, never from user-supplied metadata', () => {
  assert.doesNotMatch(code, /user_metadata/);
  const uses = [...code.matchAll(/raw_user_meta_data/g)].length;
  const inHandler = (code.match(/create function public\.handle_new_user[\s\S]*?end \$\$;/) ?? [''])[0].match(/raw_user_meta_data/g)?.length ?? 0;
  assert.equal(uses, inHandler, 'raw_user_meta_data is used outside handle_new_user');
  assert.doesNotMatch(strip(sql[files[0]]), /\brole\b[^,\n]*app_role[^,\n]*default 'admin'/);
});

test('profiles has no privileged column', () => {
  const profiles = code.match(/create table public\.profiles \(([\s\S]*?)\n\);/)[1];
  assert.doesNotMatch(profiles, /\b(is_admin|role|admin)\b\s+(boolean|text|public\.app_role)/);
});

test('every SECURITY DEFINER function pins search_path', () => {
  for (const m of code.matchAll(/create (?:or replace )?function[\s\S]*?(?=\n\$\$;|\nend \$\$;)/g)) {
    if (/security definer/i.test(m[0])) assert.match(m[0], /set search_path = ''/, m[0].slice(0, 60));
  }
});

test('anonymous visitors can only read content and send contact messages', () => {
  const anonGrants = [...code.matchAll(/grant ([^;]*?) on ([^;]*?) to ([^;]*?)anon([^;]*);/gi)];
  for (const [, privs, on] of anonGrants) {
    if (/insert|update|delete/i.test(privs)) assert.match(on, /^public\.contact_messages$/, `anon may write: ${on}`);
  }
  assert.doesNotMatch(code, /grant[^;]*\bto anon[^;]*service_role/i);
});

test('every write policy on managed content requires is_admin()', () => {
  for (const m of code.matchAll(/create policy "admins[^"]*" on public\.(\w+)\s+for (?:all|insert|update|delete)[^;]*;/g)) {
    assert.match(m[0], /public\.is_admin\(\)/, m[0].slice(0, 80));
  }
});

test('member-owned tables scope to auth.uid()', () => {
  for (const t of ['bookmarks', 'notifications']) {
    const pols = [...code.matchAll(new RegExp(`create policy "[^"]+" on public\\.${t}[\\s\\S]*?;`, 'g'))].map((m) => m[0]);
    assert.ok(pols.length >= 3, `${t} policies`);
    for (const p of pols) assert.match(p, /auth\.uid\(\)/, p.slice(0, 80));
  }
  assert.match(code, /create policy "own bookmarks add"[\s\S]*?user_id = \(select auth\.uid\(\)\)/);
});

test('members may only mark notifications read (column-level grant)', () => {
  assert.match(code, /grant update \(read_at\) on public\.notifications to authenticated/);
  assert.doesNotMatch(code, /grant[^;]*\bupdate on public\.notifications[^(]/);
});

test('public reads of managed content are limited to published rows', () => {
  assert.match(code, /status = ''published'' or public\.is_admin\(\)/);
  assert.match(code, /create policy "public reads published discussions"[\s\S]*?status = 'published' or public\.is_admin\(\)/);
});

test('audit trail stores who and what, not row contents', () => {
  const fn = code.match(/create function public\.log_admin_change[\s\S]*?end \$\$;/)[0];
  assert.match(fn, /insert into public\.audit_events \(actor_id, action, table_name, record_id\)/);
  assert.doesNotMatch(fn, /to_jsonb\((new|old)\)\s*\)?\s*(,|\))\s*\n?\s*values/);
});

test('the bootstrap script is the only place that grants the admin role', () => {
  const bootstrap = fs.readFileSync(path.join(root, 'supabase/bootstrap_admin.sql'), 'utf8');
  assert.match(bootstrap, /insert into public\.user_roles/);
  assert.doesNotMatch(code, /insert into public\.user_roles/);
  assert.doesNotMatch(bootstrap, /service_role|password/i);
});

test('seed.sql is up to date with src/data and only upserts sample content', () => {
  const before = fs.readFileSync(path.join(root, 'supabase/seed.sql'), 'utf8');
  execFileSync(process.execPath, [path.join(root, 'scripts/generate-seed.mjs')], { stdio: 'pipe' });
  const after = fs.readFileSync(path.join(root, 'supabase/seed.sql'), 'utf8');
  assert.equal(after, before, 'supabase/seed.sql was stale; it has been regenerated, commit the new file');
  const seed = strip(after).replace(/\$j\$[\s\S]*?\$j\$/g, "''");
  assert.doesNotMatch(seed.replace(/do update set/gi, ''), /\b(delete|truncate|drop|update)\b\s/i, 'seed may only insert/upsert');
  for (const m of seed.matchAll(/insert into public\.(\w+)/g)) assert.ok(tables.includes(m[1]), `seed targets unknown table ${m[1]}`);
  for (const m of seed.matchAll(/insert into public\.(innovations|articles|courses|experts|startups|organizations|partnerships|discussions)[^;]*?on conflict/gs)) {
    assert.match(m[0], /'published', true/, `${m[1]} seed rows must be is_sample = true`);
  }
});

test('no secret or service-role key appears in source or config', () => {
  const scan = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (e.name === 'node_modules' ? [] : scan(path.join(d, e.name))) : [path.join(d, e.name)]));
  for (const f of [...scan(path.join(root, 'src')), path.join(root, 'vite.config.js'), path.join(root, 'index.html')]) {
    const txt = fs.readFileSync(f, 'utf8');
    assert.doesNotMatch(txt, /service_role|SERVICE_ROLE/, `${path.relative(root, f)} mentions a service-role key`);
    assert.doesNotMatch(txt, /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, `${path.relative(root, f)} contains a JWT-like value`);
  }
});
