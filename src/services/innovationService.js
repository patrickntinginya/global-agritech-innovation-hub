// Innovation data from Supabase. The exported names and the returned shapes are the Phase 1 contract, so pages did not change.
// Public pages always filter on status = 'published' in the query itself (RLS also enforces it), so an admin who is
// signed in never sees drafts leak into the public site.
import { getClient } from '../lib/supabase.js';
import { exec, likePattern } from './errors.js';
import { mapInnovation } from './mappers.js';
import { categories } from '../data/categories.js';

const off = (v) => !v || v === 'all';
const published = () => getClient().from('innovations').select('*', { count: 'exact' }).eq('status', 'published');
const MAX_LIST = 500;

export async function listInnovations() {
  const { data } = await exec(published().order('added_on', { ascending: false }).order('slug').limit(MAX_LIST));
  return data.map(mapInnovation);
}

// Featured = the newest published innovations. (Phase 1 used a hand-picked id list.)
export async function listFeaturedInnovations(limit = 6) {
  const { data } = await exec(published().order('added_on', { ascending: false }).order('slug').limit(limit));
  return data.map(mapInnovation);
}

export async function getInnovation(slug) {
  const { data } = await exec(published().eq('slug', String(slug)).limit(1));
  return data[0] ? mapInnovation(data[0]) : null;
}

export async function getInnovationsByIds(slugs) {
  if (!slugs?.length) return [];
  const { data } = await exec(published().in('slug', slugs));
  const bySlug = new Map(data.map((r) => [r.slug, mapInnovation(r)]));
  return slugs.map((s) => bySlug.get(s)).filter(Boolean);
}

// Same category first, then same country or sector.
export async function listRelatedInnovations(slug, limit = 3) {
  const base = await getInnovation(slug);
  if (!base) return [];
  const [byCategory, byCountry, bySector] = await Promise.all([
    exec(published().eq('category_id', base.categoryId).neq('slug', slug).limit(20)),
    exec(published().eq('country_id', base.countryId).neq('slug', slug).limit(20)),
    exec(published().eq('sector', base.sector).neq('slug', slug).limit(20)),
  ]);
  const seen = new Map();
  for (const r of [...byCategory.data, ...byCountry.data, ...bySector.data]) if (!seen.has(r.slug)) seen.set(r.slug, mapInnovation(r));
  return [...seen.values()]
    .map((i) => ({ item: i, score: (i.categoryId === base.categoryId ? 3 : 0) + (i.countryId === base.countryId ? 2 : 0) + (i.sector === base.sector ? 1 : 0) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.item.added.localeCompare(a.item.added))
    .slice(0, limit)
    .map((r) => r.item);
}

// Filters: q (keyword), categoryId, countryId, sector ('crop' | 'livestock'), application.
// Sort: 'newest' (default) | 'alpha' (or 'alphabetical') | 'category'. 'all' means no filter. Pagination: page, pageSize.
// Filtering, sorting and paging all happen in the database; only one page of rows is transferred.
export async function queryInnovations({
  q = '', category = '', country = '', categoryId = category, countryId = country, sector = '', application = '',
  sort = 'newest', page = 1, pageSize = 9,
} = {}) {
  const size = Math.min(Math.max(1, Number(pageSize) || 9), 50);
  const run = (pageNo) => {
    let query = published();
    if (!off(categoryId)) query = query.eq('category_id', categoryId);
    if (!off(countryId)) query = query.eq('country_id', countryId);
    if (!off(sector)) query = query.eq('sector', sector);
    if (!off(application)) query = query.contains('application_ids', [application]);
    if (q.trim().length > 0) query = query.ilike('search_text', likePattern(q));
    if (sort === 'alphabetical' || sort === 'alpha') query = query.order('title->>en', { ascending: true });
    else if (sort === 'category') query = query.order('category_id', { ascending: true }).order('title->>en', { ascending: true });
    else query = query.order('added_on', { ascending: false }).order('slug', { ascending: true });
    const from = (pageNo - 1) * size;
    return exec(query.range(from, from + size - 1));
  };
  let current = Math.max(1, Number(page) || 1);
  let res = await run(current);
  const total = res.count ?? res.data.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  if (current > pageCount) {
    current = pageCount;
    res = await run(current);
  }
  return { total, pageCount, page: current, items: res.data.map(mapInnovation) };
}

const FIELD_COLUMN = { categoryId: 'category_id', countryId: 'country_id', sector: 'sector' };

// Innovations whose `field` ('categoryId' | 'countryId' | 'sector') equals `value`, newest first.
export async function listInnovationsBy(field, value) {
  const column = FIELD_COLUMN[field];
  if (!column) return [];
  const { data } = await exec(published().eq(column, value).order('added_on', { ascending: false }).order('slug').limit(MAX_LIST));
  return data.map(mapInnovation);
}

// [{ categoryId, count }] for every category, including categories with no records yet.
export async function countByCategory() {
  const { data } = await exec(getClient().from('innovations').select('category_id').eq('status', 'published').limit(5000));
  const counts = new Map();
  for (const r of data) counts.set(r.category_id, (counts.get(r.category_id) ?? 0) + 1);
  return categories.map((c) => ({ categoryId: c.id, count: counts.get(c.id) ?? 0 }));
}
