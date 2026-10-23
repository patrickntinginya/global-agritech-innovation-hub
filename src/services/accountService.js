// Everything a signed-in member does with their own data. Row Level Security scopes each query to the signed-in user;
// the queries below also filter by user id so a mistake in a policy would not silently widen the result.
import { getClient } from '../lib/supabase.js';
import { exec, ServiceError } from './errors.js';
import { mapDiscussion, mapNotification, mapProfile, mapSubmission } from './mappers.js';

// Control characters and zero-width characters are removed; React renders everything as text, never as HTML.
// eslint-disable-next-line no-control-regex
export const cleanText = (v) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200D\uFEFF]/g, '').trim();

export function makeSlug(title, random = () => Math.random().toString(36).slice(2, 8)) {
  const base = cleanText(title).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/g, '');
  return `${base || 'post'}-${random()}`;
}

// ---- Profile ----
export async function getMyProfile(userId) {
  const { data } = await exec(getClient().from('profiles').select('*').eq('id', userId).limit(1));
  return data[0] ? mapProfile(data[0]) : null;
}

export async function updateMyProfile(userId, values) {
  const row = {};
  if ('displayName' in values) row.display_name = cleanText(values.displayName).slice(0, 80);
  if ('country' in values) row.country = cleanText(values.country).slice(0, 80) || null;
  if ('role' in values) row.account_type = values.role || null;
  if ('bio' in values) row.bio = cleanText(values.bio).slice(0, 500) || null;
  if ('interests' in values) row.interests = values.interests ?? [];
  if ('language' in values) row.language = values.language;
  if (values.notify) {
    row.notify_content = Boolean(values.notify.content);
    row.notify_community = Boolean(values.notify.community);
    row.notify_learning = Boolean(values.notify.learning);
  }
  const { data } = await exec(getClient().from('profiles').update(row).eq('id', userId).select());
  // An UPDATE that matches no row (blocked by policy, or no profile) must never look like success.
  if (!data?.length) throw new ServiceError('not_found', 'profile');
  return mapProfile(data[0]);
}

// ---- Bookmarks (innovations and articles) ----
export async function listMyBookmarks(userId) {
  const { data } = await exec(
    getClient().from('bookmarks').select('id, created_at, innovation:innovations(slug), article:articles(slug)')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(500),
  );
  return {
    innovations: data.filter((b) => b.innovation).map((b) => b.innovation.slug),
    articles: data.filter((b) => b.article).map((b) => b.article.slug),
  };
}

const TABLE = { innovation: 'innovations', article: 'articles' };
const COLUMN = { innovation: 'innovation_id', article: 'article_id' };

async function uuidOf(kind, slug) {
  const { data } = await exec(getClient().from(TABLE[kind]).select('id').eq('slug', slug).eq('status', 'published').limit(1));
  if (!data[0]) throw new ServiceError('not_found', `${kind}:${slug}`);
  return data[0].id;
}

export async function addBookmark(userId, kind, slug) {
  const id = await uuidOf(kind, slug);
  await exec(getClient().from('bookmarks').insert({ user_id: userId, [COLUMN[kind]]: id }));
}

export async function removeBookmark(userId, kind, slug) {
  const id = await uuidOf(kind, slug);
  await exec(getClient().from('bookmarks').delete().eq('user_id', userId).eq(COLUMN[kind], id));
}

// ---- Notifications ----
export async function listMyNotifications(userId, limit = 50) {
  const { data } = await exec(getClient().from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit));
  return data.map(mapNotification);
}
export async function markNotificationRead(userId, id) {
  const { data } = await exec(getClient().from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId).select());
  if (!data?.length) throw new ServiceError('not_found', 'notification');
}
export async function markAllNotificationsRead(userId) {
  await exec(getClient().from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null));
}
export async function deleteNotification(userId, id) {
  await exec(getClient().from('notifications').delete().eq('id', id).eq('user_id', userId));
}

// ---- Content submissions ----
export async function createSubmission(userId, v) {
  await exec(getClient().from('content_submissions').insert({
    user_id: userId, kind: v.kind, title: cleanText(v.title), organization: cleanText(v.organization),
    country_id: v.country, category_id: v.category, description: cleanText(v.description), contact_email: cleanText(v.email),
  }));
}
export async function listMySubmissions(userId) {
  const { data } = await exec(getClient().from('content_submissions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50));
  return data.map(mapSubmission);
}

// ---- Contact form (anyone may send; only administrators can read) ----
export async function sendContactMessage(v) {
  await exec(getClient().from('contact_messages').insert({
    name: cleanText(v.name), email: cleanText(v.email), reason: v.reason || 'general', subject: cleanText(v.subject), message: cleanText(v.message),
  }));
}

// ---- Community ----
export async function listMyDiscussions(userId) {
  const { data } = await exec(getClient().from('discussions').select('*').eq('author_id', userId).order('created_at', { ascending: false }).limit(10));
  return data.map(mapDiscussion);
}
export async function createDiscussion(userId, v) {
  const title = cleanText(v.title);
  const body = cleanText(v.body);
  const slug = makeSlug(title);
  await exec(getClient().from('discussions').insert({
    slug, kind: v.kind, topic: v.topic, title: { en: title, sw: title }, body: { en: body, sw: body }, status: 'published', author_id: userId,
  }));
  return slug;
}
export async function createReply(userId, discussionUuid, text) {
  const body = cleanText(text);
  await exec(getClient().from('discussion_replies').insert({
    discussion_id: discussionUuid, status: 'published', body: { en: body, sw: body }, author_id: userId,
  }));
}
export async function acceptReply(replyId) {
  await exec(getClient().rpc('accept_reply', { p_reply: replyId }));
}
