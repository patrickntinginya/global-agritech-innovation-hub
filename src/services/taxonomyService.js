// Taxonomies (categories, countries, sectors, applications) are edited by admins in the database, but many components
// read them synchronously from the data modules. This service loads the database rows once at start-up and refreshes
// those shared lists IN PLACE, so every component sees the database values. If the database cannot be reached the
// bundled Phase 1 lists stay as a read-only fallback and the failure is reported to the caller.
import { getClient } from '../lib/supabase.js';
import { exec } from './errors.js';
import { setHasSampleContent } from '../lib/sampleContent.js';
import { categories, categoryById } from '../data/categories.js';
import { countries, countryById } from '../data/countries.js';
import { applications, applicationById, sectors } from '../data/taxonomies.js';

const replaceList = (list, next) => list.splice(0, list.length, ...next);
const replaceMap = (map, next, key = 'id') => {
  for (const k of Object.keys(map)) delete map[k];
  for (const item of next) map[item[key]] = item;
};

export const fromCategoryRow = (r) => ({ id: r.id, icon: r.icon, applications: r.application_ids ?? [], title: r.title, blurb: r.blurb ?? undefined, consider: r.consider ?? undefined });
export const fromCountryRow = (r) => ({ id: r.id, tone: r.tone, name: r.name, description: r.description ?? undefined });
export const fromLabelRow = (r) => ({ id: r.id, label: r.label });

export function applyTaxonomies({ categories: c, countries: k, applications: a, sectors: s }) {
  if (c?.length) { replaceList(categories, c.map(fromCategoryRow)); replaceMap(categoryById, categories); }
  if (k?.length) { replaceList(countries, k.map(fromCountryRow)); replaceMap(countryById, countries); }
  if (a?.length) { replaceList(applications, a.map(fromLabelRow)); replaceMap(applicationById, applications); }
  if (s?.length) replaceList(sectors, s.map(fromLabelRow));
}

export async function loadTaxonomies() {
  const db = getClient();
  const [c, k, a, s] = await Promise.all([
    exec(db.from('categories').select('*').order('sort_order').order('id')),
    exec(db.from('countries').select('*').order('sort_order').order('id')),
    exec(db.from('applications').select('*').order('sort_order').order('id')),
    exec(db.from('sectors').select('*').order('sort_order').order('id')),
  ]);
  const sample = await exec(db.from('innovations').select('id', { count: 'exact', head: true }).eq('status', 'published').eq('is_sample', true));
  setHasSampleContent((sample.count ?? 0) > 0);
  const rows = { categories: c.data, countries: k.data, applications: a.data, sectors: s.data };
  applyTaxonomies(rows);
  return rows;
}
