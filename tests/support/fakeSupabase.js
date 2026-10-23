// In-memory stand-in for the Supabase client, used by unit tests and browser checks.
// It implements the query-builder subset the app uses and MODELS the row-level rules and triggers from the SQL
// migrations (published-only reads, admin-only writes, owner-only member data, server-stamped authors).
// It is a model, not the real database: it proves the application code behaves correctly against those rules,
// it does NOT prove the SQL policies themselves. Those need a real Supabase project (see tests/sql and the README).
import { buildSeedTables } from './seedRows.js';

const MANAGED = ['sectors', 'applications', 'categories', 'countries', 'innovations', 'articles', 'courses', 'experts', 'startups', 'organizations', 'partnerships', 'site_settings'];
const STATUS_TABLES = ['innovations', 'articles', 'courses', 'experts', 'startups', 'organizations', 'partnerships', 'discussions', 'discussion_replies'];
const RELATIONS = {
  discussions: { discussion_replies: { table: 'discussion_replies', many: true, fk: 'discussion_id', local: 'id' } },
  bookmarks: { innovations: { table: 'innovations', fk: 'id', local: 'innovation_id' }, articles: { table: 'articles', fk: 'id', local: 'article_id' } },
};
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const err = (code, message) => ({ code, message });
const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
const pathGet = (row, col) => (col.includes('->>') ? col.split('->>').reduce((o, k, i) => (i === 0 ? o[k] : o?.[k]), row) : row[col]);
const likeRegex = (pat) => {
  const esc = (c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let out = '';
  for (let i = 0; i < pat.length; i += 1) {
    const c = pat[i];
    if (c === '\\' && i + 1 < pat.length) { i += 1; out += esc(pat[i]); } // backslash escapes the next character literally
    else if (c === '%') out += '.*';
    else if (c === '_') out += '.';
    else out += esc(c);
  }
  return new RegExp(`^${out}$`, 'is');
};

export function createFakeSupabase({ admins = [], autoConfirm = false, failNext = null } = {}) {
  const tables = buildSeedTables();
  const state = { users: [], session: null, listeners: new Set(), nextId: 1000, calls: [], failNext, admins: new Set(admins) };
  const ctx = () => ({ uid: state.session?.user.id ?? null, admin: Boolean(state.session && state.admins.has(state.session.user.email)) });
  const newId = () => `10000000-0000-4000-8000-${String(++state.nextId).padStart(12, '0')}`;
  const searchText = (table, r) => {
    const j = (v) => `${v?.en ?? ''} ${v?.sw ?? ''}`;
    if (table === 'experts' || table === 'startups') return `${r.name} ${j(r.area_label ?? r.description)}`.toLowerCase();
    if (table === 'courses') return `${j(r.title)} ${j(r.description)}`.toLowerCase();
    return `${j(r.title)} ${j(r.summary ?? r.body)}`.toLowerCase();
  };
  const withGenerated = (table, r) => (['innovations', 'articles', 'courses', 'experts', 'startups', 'discussions'].includes(table) ? { ...r, search_text: searchText(table, r) } : r);

  // ----- row level rules (mirrors supabase/migrations/*_rls_and_grants.sql) -----
  const canSee = (table, r) => {
    const { uid, admin } = ctx();
    if (admin && !['bookmarks', 'notifications'].includes(table)) return true; // profiles/user_roles: admins read all (see RLS migration)
    if (STATUS_TABLES.includes(table)) {
      if (table === 'discussion_replies') return r.status === 'published' && tables.discussions.some((d) => d.id === r.discussion_id && d.status === 'published');
      return r.status === 'published';
    }
    if (['sectors', 'applications', 'categories', 'countries'].includes(table)) return true;
    if (table === 'site_settings') return r.is_public;
    if (['profiles'].includes(table)) return uid && r.id === uid;
    if (['user_roles'].includes(table)) return uid && r.user_id === uid;
    if (['bookmarks', 'notifications'].includes(table)) return uid && r.user_id === uid;
    if (table === 'content_submissions') return uid && r.user_id === uid;
    return false; // contact_messages, audit_events: admins only (handled above)
  };
  const canWrite = (op, table, r) => {
    const { uid, admin } = ctx();
    if (MANAGED.includes(table)) return admin;
    if (table === 'discussions' || table === 'discussion_replies') return op === 'insert' ? Boolean(uid) : admin;
    if (table === 'profiles') return Boolean(uid) && r.id === uid && op !== 'delete';
    if (table === 'bookmarks') return Boolean(uid) && r.user_id === uid && op !== 'update';
    if (table === 'notifications') return Boolean(uid) && r.user_id === uid && op !== 'insert';
    if (table === 'content_submissions') return op === 'insert' ? Boolean(uid) : admin;
    if (table === 'contact_messages') return op === 'insert' ? true : admin;
    return false;
  };
  const check = (table, r) => {
    if (r.slug !== undefined && !SLUG.test(r.slug)) return err('23514', 'slug check');
    if (table === 'contact_messages') {
      if (!(r.name?.length >= 1) || !EMAIL.test(r.email ?? '') || !(r.subject?.length >= 3) || !(r.message?.length >= 10)) return err('23514', 'contact check');
    }
    if (table === 'content_submissions' && (!(r.title?.length >= 5) || !(r.description?.length >= 30) || !EMAIL.test(r.contact_email ?? ''))) return err('23514', 'submission check');
    if (table === 'profiles' && !(r.display_name?.length >= 1 && r.display_name.length <= 80)) return err('23514', 'profile check');
    if (['innovations', 'articles', 'courses', 'discussions'].includes(table) && r.title && !(r.title.en && r.title.sw)) return err('23514', 'bilingual check');
    return null;
  };
  const uniques = { innovations: ['slug'], articles: ['slug'], courses: ['slug'], experts: ['slug'], startups: ['slug'], organizations: ['slug'], partnerships: ['slug'], discussions: ['slug'], categories: ['id'], countries: ['id'], site_settings: ['key'] };
  const audit = (action, table, row) => {
    if (!ctx().admin || table === 'audit_events') return;
    tables.audit_events.push({ id: tables.audit_events.length + 1, actor_id: ctx().uid, action, table_name: table, record_id: String(row.id ?? row.key), created_at: new Date().toISOString() });
  };

  // ----- query builder -----
  class Query {
    constructor(table) { this.table = table; this.op = 'select'; this.filters = []; this.orders = []; this.cols = '*'; this.opts = {}; this.range_ = null; this.limit_ = null; this.returning = false; this.payload = null; }
    select(cols = '*', opts = {}) { if (this.op === 'select') { this.cols = cols; this.opts = opts; } else this.returning = true; return this; }
    insert(p) { this.op = 'insert'; this.payload = p; return this; }
    update(p) { this.op = 'update'; this.payload = p; return this; }
    upsert(p, o) { this.op = 'upsert'; this.payload = p; this.conflict = o?.onConflict; return this; }
    delete() { this.op = 'delete'; return this; }
    eq(c, v) { this.filters.push((r) => pathGet(r, c) === v); return this; }
    neq(c, v) { this.filters.push((r) => pathGet(r, c) !== v); return this; }
    in(c, vs) { this.filters.push((r) => vs.includes(pathGet(r, c))); return this; }
    is(c, v) { this.filters.push((r) => (v === null ? r[c] == null : r[c] === v)); return this; }
    contains(c, vs) { this.filters.push((r) => vs.every((v) => (r[c] ?? []).includes(v))); return this; }
    ilike(c, pat) { const re = likeRegex(pat); this.filters.push((r) => re.test(String(r[c] ?? ''))); return this; }
    order(c, o = {}) { this.orders.push({ c, asc: o.ascending !== false, ref: o.referencedTable }); return this; }
    limit(n) { this.limit_ = n; return this; }
    range(a, b) { this.range_ = [a, b]; return this; }
    then(res, rej) { return Promise.resolve().then(() => this.run()).then(res, rej); }

    embed(rows) {
      const parts = this.cols.split(/,(?![^(]*\))/).map((s) => s.trim()).filter(Boolean);
      const rels = parts.filter((p) => p.includes('('));
      if (!rels.length) return rows;
      return rows.map((r) => {
        const out = { ...r };
        for (const rel of rels) {
          const m = /^(?:(\w+):)?(\w+)\((.*)\)$/.exec(rel);
          const [, alias, name] = m;
          const def = RELATIONS[this.table]?.[name];
          if (!def) continue;
          const related = tables[def.table].filter((x) => x[def.fk] === r[def.local] && canSee(def.table, x));
          const refOrder = this.orders.find((o) => o.ref === name);
          if (refOrder) related.sort((a, b) => String(a[refOrder.c]).localeCompare(String(b[refOrder.c])) * (refOrder.asc ? 1 : -1));
          out[alias ?? name] = def.many ? related.map(clone) : (related[0] ? clone(related[0]) : null);
        }
        return out;
      });
    }

    run() {
      state.calls.push(`${this.op} ${this.table}`);
      if (state.failNext) { const e = state.failNext; state.failNext = null; return { data: null, error: e, count: null }; }
      if (!tables[this.table]) return { data: null, error: err('42P01', `no table ${this.table}`), count: null };
      const rows = tables[this.table];
      const match = (r) => this.filters.every((f) => f(withGenerated(this.table, r)));
      if (this.op === 'select') {
        let found = rows.filter((r) => canSee(this.table, r)).map((r) => withGenerated(this.table, r)).filter((r) => this.filters.every((f) => f(r)));
        for (const o of [...this.orders].reverse().filter((x) => !x.ref)) found.sort((a, b) => { const x = pathGet(a, o.c), y = pathGet(b, o.c); return (x == null ? 1 : y == null ? -1 : String(x).localeCompare(String(y))) * (o.asc ? 1 : -1); });
        const count = found.length;
        if (this.range_) found = found.slice(this.range_[0], this.range_[1] + 1);
        else if (this.limit_ != null) found = found.slice(0, this.limit_);
        if (this.opts.head) return { data: null, error: null, count };
        return { data: clone(this.embed(found)), error: null, count: this.opts.count ? count : null };
      }
      if (this.op === 'insert' || this.op === 'upsert') {
        const list = Array.isArray(this.payload) ? this.payload : [this.payload];
        const made = [];
        for (const input of list) {
          let row = { ...input };
          if (this.table === 'discussions' || this.table === 'discussion_replies') {
            if (ctx().uid) { row.author_id = ctx().uid; row.author_label = null; row.is_sample = false; row.author_name = tables.profiles.find((p) => p.id === ctx().uid)?.display_name ?? null; if (this.table === 'discussion_replies') row.accepted = false; }
          }
          if (this.table === 'content_submissions' && ctx().uid) { row.user_id = ctx().uid; row.status = 'pending'; }
          if (this.table === 'contact_messages') { row.user_id = ctx().uid; row.status = 'new'; }
          if (this.table === 'discussions') row = { status: 'published', is_sample: false, posted_on: '2026-10-19', ...row };
          if (this.table === 'discussion_replies') row = { status: 'published', ...row };
          if (this.table === 'bookmarks') { row = { innovation_id: null, article_id: null, ...row }; }
          if (STATUS_TABLES.includes(this.table) && !('status' in row)) row.status = 'draft';
          if (this.table !== 'site_settings' && !('id' in row) && !['categories', 'countries', 'sectors', 'applications'].includes(this.table)) row.id = newId();
          row.created_at = row.created_at ?? new Date().toISOString();
          if (!canWrite('insert', this.table, row)) return { data: this.returning ? [] : null, error: ctx().uid || this.table === 'contact_messages' ? err('42501', 'new row violates row-level security policy') : err('42501', 'permission denied'), count: null };
          const bad = check(this.table, row);
          if (bad) return { data: null, error: bad, count: null };
          if (this.table === 'bookmarks' && ((row.innovation_id && !tables.innovations.some((x) => x.id === row.innovation_id && canSee('innovations', x))) || (row.article_id && !tables.articles.some((x) => x.id === row.article_id && canSee('articles', x))))) return { data: null, error: err('42501', 'rls'), count: null };
          const keys = this.conflict ? [this.conflict] : uniques[this.table] ?? [];
          const dup = rows.find((r) => keys.some((k) => r[k] === row[k]) || (this.table === 'bookmarks' && r.user_id === row.user_id && ((row.innovation_id && r.innovation_id === row.innovation_id) || (row.article_id && r.article_id === row.article_id))));
          if (dup && this.op === 'upsert') { Object.assign(dup, row); audit('update', this.table, dup); made.push(dup); continue; }
          if (dup) return { data: null, error: err('23505', 'duplicate key value'), count: null };
          rows.push(row); audit('insert', this.table, row); made.push(row);
        }
        return { data: this.returning || this.op === 'upsert' ? clone(made) : null, error: null, count: null };
      }
      // update / delete: rows hidden by the rules simply do not match, exactly like Postgres RLS (no error, zero rows)
      const targets = rows.filter((r) => canSee(this.table, r) && match(r));
      const allowed = targets.filter((r) => canWrite(this.op, this.table, r));
      if (this.op === 'update') {
        if (this.table === 'notifications') { const extra = Object.keys(this.payload).filter((k) => k !== 'read_at'); if (extra.length) return { data: null, error: err('42501', 'permission denied for column'), count: null }; }
        for (const r of allowed) { const merged = { ...r, ...this.payload, updated_at: new Date().toISOString() }; const bad = check(this.table, merged); if (bad) return { data: null, error: bad, count: null }; Object.assign(r, merged); audit('update', this.table, r); }
      } else {
        for (const r of allowed) { rows.splice(rows.indexOf(r), 1); audit('delete', this.table, r); }
        if (this.table === 'discussions') for (const r of allowed) tables.discussion_replies = tables.discussion_replies.filter((x) => x.discussion_id !== r.id);
      }
      return { data: this.returning ? clone(allowed) : null, error: null, count: null };
    }
  }

  // ----- rpc -----
  const rpc = async (name, args) => {
    state.calls.push(`rpc ${name}`);
    if (name === 'is_admin') return { data: ctx().admin, error: null };
    if (name === 'accept_reply') {
      const r = tables.discussion_replies.find((x) => x.id === args.p_reply);
      if (!r) return { data: null, error: err('P0002', 'reply not found') };
      const d = tables.discussions.find((x) => x.id === r.discussion_id);
      if (!(ctx().admin || (ctx().uid && d.author_id === ctx().uid))) return { data: null, error: err('42501', 'not authorized') };
      tables.discussion_replies.filter((x) => x.discussion_id === d.id).forEach((x) => { x.accepted = x.id === args.p_reply; });
      return { data: null, error: null };
    }
    if (name === 'admin_broadcast_notification') {
      if (!ctx().admin) return { data: null, error: err('42501', 'not authorized') };
      const pref = { content: 'notify_content', community: 'notify_community', learning: 'notify_learning' }[args.p_kind];
      const targets = tables.profiles.filter((p) => args.p_kind === 'system' || p[pref]);
      targets.forEach((p) => tables.notifications.push({ id: newId(), user_id: p.id, kind: args.p_kind, title: args.p_title, body: args.p_body, link: args.p_link, read_at: null, created_at: new Date().toISOString() }));
      audit('broadcast', 'notifications', { id: targets.length });
      return { data: targets.length, error: null };
    }
    return { data: null, error: err('42883', 'unknown function') };
  };

  // ----- auth -----
  const emit = (event) => state.listeners.forEach((cb) => cb(event, state.session));
  const auth = {
    async getSession() { return { data: { session: state.session }, error: null }; },
    onAuthStateChange(cb) { state.listeners.add(cb); return { data: { subscription: { unsubscribe: () => state.listeners.delete(cb) } } }; },
    async signUp({ email, password, options }) {
      if ((password ?? '').length < 8) return { data: {}, error: { code: 'weak_password', message: 'Password should be at least 8 characters', status: 422 } };
      if (state.users.some((u) => u.email === email)) return { data: { user: { identities: [] }, session: null }, error: null };
      const user = { id: newId(), email, password, identities: [{ id: 'x' }] };
      state.users.push(user);
      const m = options?.data ?? {};
      tables.profiles.push({ id: user.id, display_name: (m.display_name || email.split('@')[0]).slice(0, 80), country: m.country ?? null, account_type: m.account_type ?? null, bio: null, interests: [], language: m.language === 'sw' ? 'sw' : 'en', notify_content: true, notify_community: true, notify_learning: false, created_at: new Date().toISOString() });
      if (autoConfirm) { state.session = { user: { id: user.id, email } }; emit('SIGNED_IN'); return { data: { user: { id: user.id, identities: user.identities }, session: state.session }, error: null }; }
      return { data: { user: { id: user.id, identities: user.identities }, session: null }, error: null };
    },
    async signInWithPassword({ email, password }) {
      const u = state.users.find((x) => x.email === email && x.password === password);
      if (!u) return { data: {}, error: { code: 'invalid_credentials', message: 'Invalid login credentials', status: 400 } };
      state.session = { user: { id: u.id, email } };
      emit('SIGNED_IN');
      return { data: { session: state.session }, error: null };
    },
    async signOut() { state.session = null; emit('SIGNED_OUT'); return { error: null }; },
    async resetPasswordForEmail(email, opts) { state.calls.push(`reset ${email} -> ${opts?.redirectTo}`); return { data: {}, error: null }; },
    async updateUser({ password }) {
      if (!state.session) return { data: {}, error: { code: 'session_not_found', message: 'Auth session missing!', status: 401 } };
      const u = state.users.find((x) => x.id === state.session.user.id);
      if (u.password === password) return { data: {}, error: { code: 'same_password', message: 'New password should be different from the old password.', status: 422 } };
      u.password = password; return { data: {}, error: null };
    },
  };

  return {
    from: (table) => new Query(table), rpc, auth,
    // test controls
    __tables: tables, __state: state, __loseSession() { state.session = null; emit('SIGNED_OUT'); },
    __addUser(email, password, { admin = false } = {}) { const u = { id: newId(), email, password, identities: [{}] }; state.users.push(u); tables.profiles.push({ id: u.id, display_name: email.split('@')[0], country: null, account_type: null, bio: null, interests: [], language: 'en', notify_content: true, notify_community: true, notify_learning: false, created_at: new Date().toISOString() }); if (admin) state.admins.add(email); return u; },
  };
}
