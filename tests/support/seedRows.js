// Builds database-shaped rows from the Phase 1 demo data (the same mapping scripts/generate-seed.mjs writes as SQL).
import * as D from '../../src/data/categories.js';
import { countries } from '../../src/data/countries.js';
import { applications, sectors } from '../../src/data/taxonomies.js';
import { innovations } from '../../src/data/innovations.js';
import { knowledgeItems } from '../../src/data/knowledge.js';
import { courses } from '../../src/data/courses.js';
import { experts } from '../../src/data/experts.js';
import { startups } from '../../src/data/startups.js';
import { opportunities, challenges, organizations } from '../../src/data/partnerships.js';
import { discussions } from '../../src/data/discussions.js';

let n = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;
const base = (slug, extra) => ({ id: uuid(), slug, status: 'published', is_sample: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z', ...extra });
const bi = (v) => (typeof v === 'string' ? { en: v, sw: v } : v);

const startupNeeds = {
  s1: { en: ['Pilot farms', 'Distribution partners'], sw: ['Mashamba ya majaribio', 'Washirika wa usambazaji'] },
  s2: { en: ['Veterinary partners', 'Pilot herds'], sw: ['Washirika wa huduma za mifugo', 'Makundi ya majaribio'] },
  s3: { en: ['Farmer groups', 'Grant funding'], sw: ['Vikundi vya wakulima', 'Ufadhili wa ruzuku'] },
  s4: { en: ['Buyers', 'Mobile network partners'], sw: ['Wanunuzi', 'Washirika wa mitandao ya simu'] },
  s5: { en: ['Agronomy partners', 'Pilot farms'], sw: ['Washirika wa kilimo', 'Mashamba ya majaribio'] },
  s6: { en: ['Field data', 'University partners'], sw: ['Data za shambani', 'Washirika wa vyuo'] },
};

export function buildSeedTables() {
  const t = {};
  t.sectors = sectors.map((s, i) => ({ id: s.id, label: s.label, sort_order: i }));
  t.applications = applications.map((a, i) => ({ id: a.id, label: a.label, sort_order: i }));
  t.categories = D.categories.map((c, i) => ({ id: c.id, icon: c.icon, application_ids: c.applications ?? [], title: c.title, blurb: c.blurb ?? null, consider: c.consider ?? null, sort_order: i }));
  t.countries = countries.map((c, i) => ({ id: c.id, tone: c.tone, name: c.name, description: c.description ?? null, sort_order: i }));
  t.innovations = innovations.map((i) => base(i.id, { sector: i.sector, country_id: i.countryId, category_id: i.categoryId, application_ids: i.applications, title: i.title, summary: i.summary, benefits: i.benefits, considerations: i.considerations, added_on: i.added }));
  t.articles = knowledgeItems.map((a) => base(a.id, { type: a.type, sector: a.sector, category_ids: a.categoryIds, title: a.title, summary: a.summary, body: a.body, minutes: a.minutes, published_on: a.date }));
  t.courses = courses.map((c) => base(c.id, { level: c.level, weeks: c.weeks, icon: c.icon, topic: c.category, related_category_id: c.relatedCategoryId, title: c.title, description: c.description, modules: c.modules }));
  t.experts = experts.map((e) => base(e.id, { name: e.name, country_id: e.countryId, area: e.area, area_label: e.areaLabel, bio: e.bio, expertise: e.expertise, initial: e.initial }));
  t.startups = startups.map((s) => base(s.id, { name: s.name, country_id: s.countryId, category_id: s.categoryId, stage: s.stage, description: s.description, solutions: s.solutions, needs: startupNeeds[s.id] ?? { en: [], sw: [] }, letter: s.letter }));
  t.organizations = organizations.map((o) => base(o.id, { org_type: o.type, country_id: o.countryId, name: bi(o.name), summary: o.summary }));
  t.partnerships = [
    ...opportunities.map((o) => base(o.id, { kind: 'opportunity', subtype: o.type, topic: null, phase: o.status, title: o.title, summary: o.summary })),
    ...challenges.map((c) => base(c.id, { kind: 'challenge', subtype: null, topic: c.categoryId, phase: c.status, title: c.title, summary: c.summary })),
  ];
  t.discussions = discussions.map((d) => base(d.id, { kind: d.kind, topic: d.topic, title: d.title, body: d.body, author_id: null, author_name: null, author_label: d.author, posted_on: d.date }));
  t.discussion_replies = discussions.flatMap((d) => (d.replies ?? []).map((r) => {
    const parent = t.discussions.find((x) => x.slug === d.id);
    return { id: uuid(), discussion_id: parent.id, sample_key: `${d.id}:${r.id}`, status: 'published', is_sample: true, body: r.text, accepted: Boolean(r.accepted), author_id: null, author_name: null, author_label: r.author, created_at: '2026-10-02T00:00:00Z' };
  }));
  t.site_settings = [
    { key: 'seo.default', value: { title: 'Global AgriTech Innovation Hub', description: 'Discover technologies, knowledge, and partnerships transforming agriculture.' }, is_public: true },
    { key: 'platform.general', value: { contactEmail: '', maintenanceBanner: { en: '', sw: '' } }, is_public: true },
  ];
  for (const name of ['profiles', 'user_roles', 'bookmarks', 'notifications', 'content_submissions', 'contact_messages', 'audit_events']) t[name] = [];
  return t;
}
