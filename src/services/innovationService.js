// Service boundary for innovation data. Pages call these functions, never the data files directly.
// In Phase 2 each function body is replaced with a Supabase query. The signatures stay the same.
import { innovations, featuredInnovationIds } from '../data/innovations.js';
import { categoryById } from '../data/categories.js';
import { matches, delay } from './textMatch.js';

export async function listInnovations() {
  await delay();
  return innovations;
}

export async function listFeaturedInnovations() {
  await delay();
  return featuredInnovationIds.map((id) => innovations.find((i) => i.id === id)).filter(Boolean);
}

export async function getInnovation(id) {
  await delay();
  return innovations.find((i) => i.id === id) ?? null;
}

export async function getInnovationsByIds(ids) {
  await delay(60);
  return ids.map((id) => innovations.find((i) => i.id === id)).filter(Boolean);
}

// Same category first, then same country or sector.
export async function listRelatedInnovations(id, limit = 3) {
  await delay(60);
  const base = innovations.find((i) => i.id === id);
  if (!base) return [];
  return innovations
    .filter((i) => i.id !== id)
    .map((i) => ({
      item: i,
      score: (i.categoryId === base.categoryId ? 3 : 0) + (i.countryId === base.countryId ? 2 : 0) + (i.sector === base.sector ? 1 : 0),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.item.added.localeCompare(a.item.added))
    .slice(0, limit)
    .map((r) => r.item);
}

// Filters: q (keyword), categoryId, countryId, sector ('crop' | 'livestock'), application.
// Sort: 'newest' (default) | 'alpha' (or 'alphabetical') | 'category'. 'all' means no filter. Pagination: page, pageSize.
export async function queryInnovations({
  q = '', category = '', country = '', categoryId = category, countryId = country, sector = '', application = '', sort = 'newest', page = 1, pageSize = 9,
} = {}) {
  await delay();
  // The URL uses 'all' for "no filter".
  const off = (v) => !v || v === 'all';
  categoryId = off(categoryId) ? '' : categoryId;
  countryId = off(countryId) ? '' : countryId;
  sector = off(sector) ? '' : sector;
  application = off(application) ? '' : application;
  const title = (i) => i.title.en;
  const categoryName = (i) => categoryById[i.categoryId]?.title.en ?? '';
  let rows = innovations.filter((i) => {
    if (categoryId && i.categoryId !== categoryId) return false;
    if (countryId && i.countryId !== countryId) return false;
    if (sector && i.sector !== sector) return false;
    if (application && !i.applications.includes(application)) return false;
    return matches(q, i.title, i.summary, i.benefits, categoryById[i.categoryId]?.title);
  });
  if (sort === 'alphabetical' || sort === 'alpha') rows = [...rows].sort((a, b) => title(a).localeCompare(title(b)));
  else if (sort === 'category') rows = [...rows].sort((a, b) => categoryName(a).localeCompare(categoryName(b)) || title(a).localeCompare(title(b)));
  else rows = [...rows].sort((a, b) => b.added.localeCompare(a.added));
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), pageCount);
  return { total, pageCount, page: current, items: rows.slice((current - 1) * pageSize, current * pageSize) };
}

// Innovations whose `field` (for example 'categoryId' or 'countryId') equals `value`, newest first.
export async function listInnovationsBy(field, value) {
  await delay();
  return innovations.filter((i) => i[field] === value).sort((a, b) => b.added.localeCompare(a.added));
}

// [{ categoryId, count }] for every category, including categories with no records yet.
export async function countByCategory() {
  await delay();
  return Object.keys(categoryById).map((categoryId) => ({ categoryId, count: innovations.filter((i) => i.categoryId === categoryId).length }));
}
