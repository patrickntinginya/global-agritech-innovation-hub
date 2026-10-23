import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const code = (f) => read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const walk = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

test('single-page-app fallback is configured for Netlify, Vercel and generic _redirects', () => {
  assert.match(read('netlify.toml'), /from = "\/\*"\s+to = "\/index\.html"\s+status = 200/);
  assert.match(read('netlify.toml'), /publish = "dist"/);
  const vercel = JSON.parse(read('vercel.json'));
  assert.deepEqual(vercel.rewrites, [{ source: '/(.*)', destination: '/index.html' }]);
  assert.equal(vercel.outputDirectory, 'dist');
  assert.match(read('public/_redirects'), /^\/\*\s+\/index\.html\s+200/m);
});

test('.env.example holds placeholders only and every VITE_ variable the code reads is documented', () => {
  const example = read('.env.example');
  const values = example.split('\n').filter((l) => /^[A-Z_]+=/.test(l)).map((l) => l.split('='));
  for (const [key, value] of values) {
    assert.match(key, /^VITE_/);
    assert.doesNotMatch(value, /eyJ[A-Za-z0-9_-]{20,}/, `${key} looks like a real JWT`);
    assert.doesNotMatch(value, /^[a-z]{20}\.supabase\.co/, `${key} looks like a real project`);
  }
  const used = new Set();
  for (const f of walk('src').filter((x) => /\.(jsx?|mjs)$/.test(x))) for (const m of read(f).matchAll(/VITE_[A-Z_]+/g)) used.add(m[0]);
  for (const name of used) assert.match(example, new RegExp(`^${name}=`, 'm'), `${name} is used in source but not documented in .env.example`);
  assert.doesNotMatch(example, /^[^#\n]*SERVICE_ROLE/im);
});

test('real env files and secrets are excluded from Git and from the package', () => {
  const ignore = read('.gitignore');
  assert.match(ignore, /^\.env$/m);
  assert.match(ignore, /^\.env\.\*$/m);
  assert.match(ignore, /^!\.env\.example$/m);
  assert.match(ignore, /^node_modules$/m);
  assert.ok(!fs.existsSync(path.join(root, '.env')));
});

test('no service-role key or hardcoded Supabase credential is referenced by browser code', () => {
  for (const f of walk('src').filter((x) => /\.(jsx?|mjs)$/.test(x))) {
    const text = code(f);
    assert.doesNotMatch(text, /service[_-]?role/i, `${f} mentions a service-role key`);
    assert.doesNotMatch(text, /eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{20,}/, `${f} contains a JWT-like string`);
    assert.doesNotMatch(text, /https:\/\/[a-z0-9]{15,}\.supabase\.co/, `${f} hardcodes a Supabase URL`);
  }
});

test('passwords and tokens are never written to storage or logs by application code', () => {
  for (const f of walk('src').filter((x) => /\.(jsx?|mjs)$/.test(x))) {
    const text = read(f);
    for (const m of text.matchAll(/(localStorage|sessionStorage)\.setItem\(\s*([^,)]+)/g)) {
      assert.match(m[2], /STORAGE_KEY|agritech\.lang/, `${f} writes ${m[2]} to browser storage`);
    }
    assert.doesNotMatch(text, /console\.(log|info|debug)\([^)]*(password|token|session)/i, `${f} logs a secret-like value`);
  }
});

test('auth redirects use the configurable application URL, not a hardcoded domain', () => {
  const auth = read('src/auth/AuthContext.jsx');
  assert.match(auth, /emailRedirectTo: `\$\{appUrl\(\)\}\/signin`/);
  assert.match(auth, /redirectTo: `\$\{appUrl\(\)\}\/reset-password`/);
  assert.doesNotMatch(auth, /https?:\/\/(?!schemas)/);
});

test('package.json scripts and dependencies match the documented workflow', () => {
  const pkg = JSON.parse(read('package.json'));
  for (const s of ['dev', 'build', 'preview', 'test', 'test:sql', 'check:i18n', 'seed:generate']) assert.ok(pkg.scripts[s], `script ${s}`);
  assert.ok(pkg.dependencies['@supabase/supabase-js']);
  assert.equal(Object.keys(pkg.dependencies).filter((d) => /service|admin-sdk/.test(d)).length, 0);
});
