// Administrative data access. Everything here is protected in the DATABASE: each write needs public.is_admin() under
// Row Level Security, so these functions fail for anyone else even if the screens are reached by typing a URL.
// An UPDATE or DELETE that RLS filters out matches zero rows and returns no error; every mutation below checks the
// returned rows so a blocked change is reported as a failure and never as a success.
import { getClient } from '../lib/supabase.js';
import { exec, likePattern, ServiceError } from './errors.js';

const clampPage = (n) => Math.max(1, Number(n) || 1);

export async function listRows(resource, { q = '', status = '', page = 1, pageSize = 8 } = {}) {
  const size = Math.min(Math.max(1, Number(pageSize) || 8), 50);
  const run = (n) => {
    let query = getClient().from(resource.table).select('*', { count: 'exact' });
    if (resource.statusColumn && status) query = query.eq(resource.statusColumn, status);
    if (resource.searchColumn && q.trim()) query = query.ilike(resource.searchColumn, likePattern(q));
    for (const [col, asc] of resource.order ?? [['created_at', false]]) query = query.order(col, { ascending: asc });
    return exec(query.range((n - 1) * size, n * size - 1));
  };
  let current = clampPage(page);
  let res = await run(current);
  const total = res.count ?? res.data.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  if (current > pageCount) { current = pageCount; res = await run(current); }
  return { items: res.data, total, page: current, pageCount };
}

export async function createRow(resource, row) {
  const { data } = await exec(getClient().from(resource.table).insert(row).select());
  if (!data?.length) throw new ServiceError('permission_denied', 'insert returned no row');
  return data[0];
}

export async function updateRow(resource, id, row) {
  const { data } = await exec(getClient().from(resource.table).update(row).eq(resource.pk ?? 'id', id).select());
  if (!data?.length) throw new ServiceError('permission_denied', 'update matched no row');
  return data[0];
}

export const setStatus = (resource, id, status) => updateRow(resource, id, { [resource.statusColumn]: status });

export async function deleteRow(resource, id) {
  const { data } = await exec(getClient().from(resource.table).delete().eq(resource.pk ?? 'id', id).select());
  if (!data?.length) throw new ServiceError('permission_denied', 'delete matched no row');
}

// ---- overview ----
async function count(table, apply) {
  let query = getClient().from(table).select('id', { count: 'exact', head: true });
  if (apply) query = apply(query);
  const { count: n } = await exec(query);
  return n ?? 0;
}

export async function overviewCounts() {
  const [innovPublished, innovDraft, articles, courses, pendingSubs, newMessages, members] = await Promise.all([
    count('innovations', (q) => q.eq('status', 'published')),
    count('innovations', (q) => q.eq('status', 'draft')),
    count('articles'),
    count('courses'),
    count('content_submissions', (q) => q.eq('status', 'pending')),
    count('contact_messages', (q) => q.eq('status', 'new')),
    count('profiles'),
  ]);
  return { innovPublished, innovDraft, articles, courses, pendingSubs, newMessages, members };
}

export async function recentAudit(limit = 10) {
  const { data } = await exec(getClient().from('audit_events').select('*').order('created_at', { ascending: false }).limit(limit));
  return data;
}

// ---- members (read only: roles are granted in the SQL editor, never through the app) ----
export async function listMembers({ q = '', page = 1, pageSize = 10 } = {}) {
  const size = Math.min(Math.max(1, Number(pageSize) || 10), 50);
  const run = (n) => {
    let query = getClient().from('profiles').select('*', { count: 'exact' });
    if (q.trim()) query = query.ilike('display_name', likePattern(q));
    return exec(query.order('created_at', { ascending: false }).range((n - 1) * size, n * size - 1));
  };
  let current = clampPage(page);
  let res = await run(current);
  const total = res.count ?? res.data.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  if (current > pageCount) { current = pageCount; res = await run(current); }
  const roles = await exec(getClient().from('user_roles').select('user_id, role').in('user_id', res.data.map((p) => p.id).concat(['00000000-0000-0000-0000-000000000000'])));
  const admins = new Set(roles.data.filter((r) => r.role === 'admin').map((r) => r.user_id));
  return { items: res.data.map((p) => ({ ...p, is_admin: admins.has(p.id) })), total, page: current, pageCount };
}

// ---- notifications ----
export async function broadcastNotification({ kind, title, body, link }) {
  const { data } = await exec(getClient().rpc('admin_broadcast_notification', { p_kind: kind, p_title: title, p_body: body, p_link: link || null }));
  return Number(data ?? 0);
}

// ---- site settings (SEO and platform) ----
export async function getSetting(key) {
  const { data } = await exec(getClient().from('site_settings').select('*').eq('key', key).limit(1));
  return data[0]?.value ?? null;
}
export async function saveSetting(key, value, isPublic = true) {
  const { data } = await exec(getClient().from('site_settings').upsert({ key, value, is_public: isPublic }, { onConflict: 'key' }).select());
  if (!data?.length) throw new ServiceError('permission_denied', 'settings not saved');
  return data[0].value;
}
