// Content from Supabase (articles, courses, experts, community, startups, partnerships, search).
// Same exported names and view-model shapes as Phase 1. Every public read filters status = 'published' in the query.
import { getClient } from '../lib/supabase.js';
import { exec, likePattern } from './errors.js';
import {
  mapArticle, mapCourse, mapExpert, mapStartup, mapOrganization, mapOpportunity, mapChallenge, mapDiscussion, mapInnovation,
} from './mappers.js';

const on = (v) => Boolean(v) && v !== 'all';
const LIST_LIMIT = 200;
const pub = (table, columns = '*', opts) => getClient().from(table).select(columns, opts).eq('status', 'published');
const keyword = (query, q) => (q && q.trim().length > 0 ? query.ilike('search_text', likePattern(q)) : query);

// ---- Articles ----
function articleQuery({ q = '', type = '', sector = '', categoryId = '' } = {}, opts) {
  let query = pub('articles', '*', opts);
  if (on(type)) query = query.eq('type', type);
  if (on(sector)) query = query.in('sector', [sector, 'both']);
  if (categoryId) query = query.contains('category_ids', [categoryId]);
  return keyword(query, q).order('published_on', { ascending: false }).order('slug');
}
export async function listArticles(filters = {}) {
  const { data } = await exec(articleQuery(filters).limit(LIST_LIMIT));
  return data.map(mapArticle);
}
export async function queryArticles({ page = 1, pageSize = 6, ...filters } = {}) {
  const size = Math.min(Math.max(1, Number(pageSize) || 6), 50);
  const run = (n) => exec(articleQuery(filters, { count: 'exact' }).range((n - 1) * size, n * size - 1));
  let current = Math.max(1, Number(page) || 1);
  let res = await run(current);
  const total = res.count ?? res.data.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  if (current > pageCount) {
    current = pageCount;
    res = await run(current);
  }
  return { items: res.data.map(mapArticle), total, page: current, pageCount };
}
// Related reading for a page: filter by category and/or sector, skip one id, cap the length.
export async function listArticlesFor({ categoryId = '', sector = '', excludeId = '', limit = 4 } = {}) {
  const fetchList = async (cat) => {
    let query = pub('articles').neq('slug', excludeId || '');
    if (cat) query = query.contains('category_ids', [cat]);
    if (sector) query = query.in('sector', [sector, 'both']);
    return (await exec(query.order('published_on', { ascending: false }).limit(limit))).data;
  };
  let rows = await fetchList(categoryId);
  if (rows.length === 0 && categoryId) {
    rows = (await exec(pub('articles').neq('slug', excludeId || '').order('published_on', { ascending: false }).limit(limit))).data;
  }
  return rows.map(mapArticle);
}
export async function getArticle(slug) {
  const { data } = await exec(pub('articles').eq('slug', String(slug)).limit(1));
  return data[0] ? mapArticle(data[0]) : null;
}

// ---- Courses ----
export async function listCourses({ q = '', topic = '', level = '' } = {}) {
  let query = pub('courses');
  if (on(topic)) query = query.eq('topic', topic);
  if (on(level)) query = query.eq('level', level);
  const { data } = await exec(keyword(query, q).order('slug').limit(LIST_LIMIT));
  return data.map(mapCourse);
}
export const queryCourses = listCourses;
export async function listCoursesFor({ categoryId = '', sector = '', excludeId = '', limit = 3 } = {}) {
  const fetchList = async (cat) => {
    let query = pub('courses').neq('slug', excludeId || '');
    if (cat) query = query.eq('related_category_id', cat);
    if (sector === 'livestock') query = query.eq('topic', 'livestock');
    else if (sector) query = query.neq('topic', 'livestock');
    return (await exec(query.order('slug').limit(limit))).data;
  };
  let rows = await fetchList(categoryId);
  if (rows.length === 0 && categoryId) {
    let query = pub('courses').neq('slug', excludeId || '');
    query = categoryId === 'livestock-technology' ? query.eq('topic', 'livestock') : query.neq('topic', 'livestock');
    rows = (await exec(query.order('slug').limit(limit))).data;
  }
  return rows.map(mapCourse);
}
export async function getCourse(slug) {
  const { data } = await exec(pub('courses').eq('slug', String(slug)).limit(1));
  return data[0] ? mapCourse(data[0]) : null;
}

// ---- Experts ----
export async function listExperts({ q = '', area = '' } = {}) {
  let query = pub('experts');
  if (on(area)) query = query.eq('area', area);
  const { data } = await exec(keyword(query, q).order('name').limit(LIST_LIMIT));
  return data.map(mapExpert);
}
export const queryExperts = listExperts;

// ---- Community ----
export async function listDiscussions({ q = '', topic = '', kind = '' } = {}) {
  let query = pub('discussions', '*, discussion_replies(id, accepted, status)');
  if (on(topic)) query = query.eq('topic', topic);
  if (on(kind)) query = query.eq('kind', kind);
  const { data } = await exec(keyword(query, q).order('posted_on', { ascending: false }).order('created_at', { ascending: false }).limit(LIST_LIMIT));
  return data.map(mapDiscussion);
}
export const queryDiscussions = listDiscussions;
export async function getDiscussion(slug) {
  const query = pub('discussions', '*, discussion_replies(*)').eq('slug', String(slug)).order('created_at', { referencedTable: 'discussion_replies', ascending: true }).limit(1);
  const { data } = await exec(query);
  return data[0] ? mapDiscussion(data[0]) : null;
}

// ---- Startups and partnerships ----
export async function listStartups({ q = '', stage = '', focus = '' } = {}) {
  let query = pub('startups');
  if (on(stage)) query = query.eq('stage', stage);
  if (on(focus)) query = query.eq('category_id', focus);
  const { data } = await exec(keyword(query, q).order('name').limit(LIST_LIMIT));
  return data.map(mapStartup);
}
export const queryStartups = listStartups;
export async function getStartup(slug) {
  const { data } = await exec(pub('startups').eq('slug', String(slug)).limit(1));
  if (!data[0]) return null;
  const startup = mapStartup(data[0]);
  const related = await exec(pub('innovations', 'slug').eq('category_id', startup.categoryId).order('added_on', { ascending: false }).limit(2));
  return { ...startup, innovationIds: related.data.map((r) => r.slug) };
}
export async function listOpportunities({ type = '' } = {}) {
  let query = pub('partnerships').eq('kind', 'opportunity');
  if (on(type)) query = query.eq('subtype', type);
  const { data } = await exec(query.order('created_at').order('slug').limit(LIST_LIMIT));
  return data.map(mapOpportunity);
}
export async function listChallenges() {
  const { data } = await exec(pub('partnerships').eq('kind', 'challenge').order('created_at').order('slug').limit(LIST_LIMIT));
  return data.map(mapChallenge);
}
export async function listOrganizations() {
  const { data } = await exec(pub('organizations').order('slug').limit(LIST_LIMIT));
  return data.map(mapOrganization);
}
export async function getOrganization(slug) {
  const { data } = await exec(pub('organizations').eq('slug', String(slug)).limit(1));
  return data[0] ? mapOrganization(data[0]) : null;
}

// Opportunities (kind = type), challenges and organizations.
export async function listPartnerships() {
  const [opportunities, challenges, organizations] = await Promise.all([listOpportunities(), listChallenges(), listOrganizations()]);
  return { opportunities: opportunities.map((o) => ({ ...o, kind: o.type })), challenges, organizations };
}

// ---- Global search across innovations, articles, courses, experts and startups ----
export async function searchAll(q = '') {
  const query = q.trim();
  if (query.length < 2) return { innovations: [], articles: [], courses: [], experts: [], startups: [] };
  const limit = (table, order) => keyword(pub(table), query).order(order.col, { ascending: order.asc }).limit(8);
  const [innovations, articles, courses, experts, startups] = await Promise.all([
    exec(limit('innovations', { col: 'added_on', asc: false })),
    exec(limit('articles', { col: 'published_on', asc: false })),
    exec(limit('courses', { col: 'slug', asc: true })),
    exec(limit('experts', { col: 'name', asc: true })),
    exec(limit('startups', { col: 'name', asc: true })),
  ]);
  return {
    innovations: innovations.data.map(mapInnovation),
    articles: articles.data.map(mapArticle),
    courses: courses.data.map(mapCourse),
    experts: experts.data.map(mapExpert),
    startups: startups.data.map(mapStartup),
  };
}
