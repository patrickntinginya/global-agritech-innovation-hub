// Browser stand-in for '@supabase/supabase-js' (test builds only). Persists the in-memory backend in sessionStorage across
// page reloads so session restoration can be exercised. Options come from sessionStorage.__fakeOpts (JSON).
import { createFakeSupabase } from '../support/fakeSupabase.js';

export function createClient() {
  if (window.__fake) return window.__fake;
  const opts = JSON.parse(sessionStorage.getItem('__fakeOpts') || '{}');
  const f = createFakeSupabase({ admins: ['admin@example.test'], autoConfirm: Boolean(opts.autoConfirm) });
  const saved = sessionStorage.getItem('__fake');
  if (saved) {
    const s = JSON.parse(saved);
    for (const k of Object.keys(f.__tables)) f.__tables[k].splice(0, f.__tables[k].length, ...(s.tables[k] ?? []));
    Object.assign(f.__state, { users: s.users, session: s.session, admins: new Set(s.admins) });
  } else {
    f.__addUser('admin@example.test', 'AdminPass123', { admin: true });
    f.__addUser('member@example.test', 'MemberPass123');
  }
  window.addEventListener('beforeunload', () => sessionStorage.setItem('__fake', JSON.stringify({
    tables: f.__tables, users: f.__state.users, session: f.__state.session, admins: [...f.__state.admins],
  })));
  window.__fake = f;
  return f;
}
