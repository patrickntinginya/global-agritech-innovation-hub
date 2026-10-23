// Service boundary for non-innovation content. Pages call these functions, never the data files.
// Phase 2 swaps each body for a Supabase query that returns the same shapes.
import { knowledgeItems } from '../data/knowledge.js';
import { courses as rawCourses } from '../data/courses.js';
import { experts as rawExperts } from '../data/experts.js';
import { discussions } from '../data/discussions.js';
import { startups as rawStartups } from '../data/startups.js';
import { opportunities, challenges, organizations as rawOrganizations } from '../data/partnerships.js';
import { innovations } from '../data/innovations.js';
import { categoryById } from '../data/categories.js';
import { matches, delay } from './textMatch.js';

// Filters from the URL use 'all' for "no filter".
const on = (v) => Boolean(v) && v !== 'all';
const byDateDesc = (a, b) => (b.date ?? '').localeCompare(a.date ?? '');
const paginate = (list, page = 1, pageSize = 6) => {
  const total = list.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), pageCount);
  return { items: list.slice((current - 1) * pageSize, current * pageSize), total, page: current, pageCount };
};

// View models: the data files keep their own field names, pages read these.
const courses = rawCourses.map((c) => ({
  ...c,
  topic: c.category,
  sector: c.category === 'livestock' ? 'livestock' : 'crop',
  categoryIds: [c.relatedCategoryId],
}));
const experts = rawExperts.map((e) => ({ ...e, title: e.areaLabel }));
const startupNeeds = {
  s1: { en: ['Pilot farms', 'Distribution partners'], sw: ['Mashamba ya majaribio', 'Washirika wa usambazaji'] },
  s2: { en: ['Veterinary partners', 'Pilot herds'], sw: ['Washirika wa huduma za mifugo', 'Makundi ya majaribio'] },
  s3: { en: ['Farmer groups', 'Grant funding'], sw: ['Vikundi vya wakulima', 'Ufadhili wa ruzuku'] },
  s4: { en: ['Buyers', 'Mobile network partners'], sw: ['Wanunuzi', 'Washirika wa mitandao ya simu'] },
  s5: { en: ['Agronomy partners', 'Pilot farms'], sw: ['Washirika wa kilimo', 'Mashamba ya majaribio'] },
  s6: { en: ['Field data', 'University partners'], sw: ['Data za shambani', 'Washirika wa vyuo'] },
};
const startups = rawStartups.map((s) => ({
  ...s,
  summary: s.description,
  focus: s.categoryId,
  needs: startupNeeds[s.id] ?? { en: [], sw: [] },
  innovationIds: innovations.filter((i) => i.categoryId === s.categoryId).slice(0, 2).map((i) => i.id),
}));
const organizations = rawOrganizations.map((g) => ({ ...g, kind: g.type, name: typeof g.name === 'string' ? { en: g.name, sw: g.name } : g.name }));

// ---- Articles ----
export async function listArticles({ q = '', type = '', sector = '', categoryId = '' } = {}) {
  await delay();
  return knowledgeItems
    .filter((a) => (!on(type) || a.type === type) && (!on(sector) || a.sector === sector || a.sector === 'both') && (!categoryId || a.categoryIds.includes(categoryId)))
    .filter((a) => matches(q, a.title, a.summary, a.body))
    .sort(byDateDesc);
}
export async function queryArticles({ page = 1, pageSize = 6, ...filters } = {}) {
  return paginate(await listArticles(filters), page, pageSize);
}
// Related reading for a page: filter by category and/or sector, skip one id, cap the length.
export async function listArticlesFor({ categoryId = '', sector = '', excludeId = '', limit = 4 } = {}) {
  await delay(60);
  let list = knowledgeItems.filter((a) => a.id !== excludeId && (!categoryId || a.categoryIds.includes(categoryId)) && (!sector || a.sector === sector || a.sector === 'both'));
  if (list.length === 0 && categoryId) list = knowledgeItems.filter((a) => a.id !== excludeId);
  return list.sort(byDateDesc).slice(0, limit);
}
export async function getArticle(id) {
  await delay();
  return knowledgeItems.find((a) => a.id === id) ?? null;
}

// ---- Courses ----
export async function listCourses({ q = '', topic = '', level = '' } = {}) {
  await delay();
  return courses.filter((c) => (!on(topic) || c.topic === topic) && (!on(level) || c.level === level) && matches(q, c.title, c.description, c.modules));
}
export const queryCourses = listCourses;
export async function listCoursesFor({ categoryId = '', sector = '', excludeId = '', limit = 3 } = {}) {
  await delay(60);
  let list = courses.filter((c) => c.id !== excludeId && (!categoryId || c.categoryIds.includes(categoryId)) && (!sector || c.sector === sector));
  if (list.length === 0 && categoryId) list = courses.filter((c) => c.id !== excludeId && c.sector === (categoryById[categoryId]?.id === 'livestock-technology' ? 'livestock' : 'crop'));
  return list.slice(0, limit);
}
export async function getCourse(id) {
  await delay();
  return courses.find((c) => c.id === id) ?? null;
}

// ---- Experts ----
export async function listExperts({ q = '', area = '' } = {}) {
  await delay();
  return experts.filter((e) => (!on(area) || e.area === area) && matches(q, e.name, e.areaLabel, e.bio, e.expertise));
}
export const queryExperts = listExperts;

// ---- Community ----
export async function listDiscussions({ q = '', topic = '', kind = '' } = {}) {
  await delay();
  return discussions.filter((d) => (!on(topic) || d.topic === topic) && (!on(kind) || d.kind === kind) && matches(q, d.title, d.body)).sort(byDateDesc);
}
export const queryDiscussions = listDiscussions;
export async function getDiscussion(id) {
  await delay();
  return discussions.find((d) => d.id === id) ?? null;
}

// ---- Startups and partnerships ----
export async function listStartups({ q = '', stage = '', focus = '' } = {}) {
  await delay();
  return startups.filter((s) => (!on(stage) || s.stage === stage) && (!on(focus) || s.focus === focus) && matches(q, s.name, s.description, s.solutions));
}
export const queryStartups = listStartups;
export async function getStartup(id) {
  await delay();
  return startups.find((s) => s.id === id) ?? null;
}
export async function listOpportunities({ type = '' } = {}) {
  await delay();
  return opportunities.filter((o) => !on(type) || o.type === type);
}
export async function listChallenges() {
  await delay();
  return challenges;
}
export async function listOrganizations() {
  await delay();
  return organizations;
}
export async function getOrganization(id) {
  await delay();
  return organizations.find((g) => g.id === id) ?? null;
}

// Opportunities (kind = type), challenges and organizations, as stored in data/partnerships.js.
export async function listPartnerships() {
  await delay();
  return {
    opportunities: opportunities.map((o) => ({ ...o, kind: o.type })),
    challenges,
    organizations,
  };
}

// ---- Global search across innovations, articles, courses, experts and startups ----
export async function searchAll(q = '') {
  await delay();
  const query = q.trim();
  if (!query) return { innovations: [], articles: [], courses: [], experts: [], startups: [] };
  return {
    innovations: innovations.filter((i) => matches(query, i.title, i.summary, i.benefits, categoryById[i.categoryId]?.title)),
    articles: knowledgeItems.filter((a) => matches(query, a.title, a.summary, a.body)).sort(byDateDesc),
    courses: courses.filter((c) => matches(query, c.title, c.description, c.modules)),
    experts: experts.filter((e) => matches(query, e.name, e.areaLabel, e.bio, e.expertise)),
    startups: startups.filter((s) => matches(query, s.name, s.description, s.solutions)),
  };
}
