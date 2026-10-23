import PatternTile from '../../components/PatternTile.jsx';
import { categories, categoryById } from '../../data/categories.js';
import { countries, countryById } from '../../data/countries.js';
import { innovations } from '../../data/innovations.js';
import { knowledgeItems } from '../../data/knowledge.js';
import { courses, courseLevels } from '../../data/courses.js';
import { experts } from '../../data/experts.js';
import { startups } from '../../data/startups.js';
import { opportunities, challenges } from '../../data/partnerships.js';
import { discussions, discussionTopics, userRoles } from '../../data/discussions.js';
import { adminUsers, adminMedia, adminMessages, adminNotifications, seoPages } from '../../data/adminData.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
// Short artificial delay so the loading state is visible in the demo. Phase 2 replaces these loaders with Supabase queries.
const load = (rows) => async () => { await delay(250); return rows; };

const opt = (items, labelOf) => items.map((v) => ({ value: v.id ?? v, label: labelOf(v) }));
const statusOptions = (keys) => ({ t }) => keys.map((k) => ({ value: k, label: t(`admin.status.${k}`) }));
const statusCell = (row, { t }) => <span className={`status-pill status-pill--${row.status}`}>{t(`admin.status.${row.status}`)}</span>;
const bi = (row, base, { loc }) => loc({ en: row[`${base}En`], sw: row[`${base}Sw`] });
const text = (...keys) => (row) => keys.map((k) => row[k] ?? '').join(' ');

const countryOptions = ({ loc }) => opt(countries, (c) => loc(c.name));
const categoryOptions = ({ loc }) => opt(categories, (c) => loc(c.title));

export const adminResources = {
  innovations: {
    key: 'innovations',
    load: load(innovations.map((i) => ({ id: i.id, titleEn: i.title.en, titleSw: i.title.sw, countryId: i.countryId, categoryId: i.categoryId, sector: i.sector, status: 'published' }))),
    columns: [
      { key: 'title', cell: (r, c) => bi(r, 'title', c) },
      { key: 'country', cell: (r, { loc }) => loc(countryById[r.countryId]?.name) },
      { key: 'category', cell: (r, { loc }) => loc(categoryById[r.categoryId]?.title) },
      { key: 'status', cell: statusCell },
    ],
    fields: (c) => [
      { name: 'titleEn', labelKey: 'admin.fields.titleEn' }, { name: 'titleSw', labelKey: 'admin.fields.titleSw' },
      { name: 'countryId', labelKey: 'admin.fields.country', type: 'select', options: countryOptions(c) },
      { name: 'categoryId', labelKey: 'admin.fields.category', type: 'select', options: categoryOptions(c) },
      { name: 'sector', labelKey: 'admin.fields.sector', type: 'select', options: [{ value: 'crop', label: c.t('featured.crop') }, { value: 'livestock', label: c.t('featured.livestock') }] },
      { name: 'status', labelKey: 'admin.fields.status', type: 'select', options: statusOptions(['published', 'draft', 'review'])(c) },
    ],
    rules: { titleEn: ['required', { min: 3 }], titleSw: ['required', { min: 3 }], countryId: ['required'], categoryId: ['required'], sector: ['required'], status: ['required'] },
    defaults: { status: 'draft' },
    search: text('titleEn', 'titleSw'),
    rowLabel: (r, c) => bi(r, 'title', c),
    filters: [{ key: 'status', labelKey: 'admin.cols.status', options: statusOptions(['published', 'draft', 'review']) }],
  },

  categories: {
    key: 'categories',
    load: load(categories.map((c) => ({ id: c.id, titleEn: c.title.en, titleSw: c.title.sw, icon: c.icon, count: innovations.filter((i) => i.categoryId === c.id).length }))),
    columns: [
      { key: 'title', cell: (r, c) => bi(r, 'title', c) },
      { key: 'slug', cell: (r) => r.id },
      { key: 'count', cell: (r) => r.count },
    ],
    fields: () => [
      { name: 'titleEn', labelKey: 'admin.fields.titleEn' }, { name: 'titleSw', labelKey: 'admin.fields.titleSw' },
      { name: 'icon', labelKey: 'admin.fields.icon' },
    ],
    rules: { titleEn: ['required', { min: 3 }], titleSw: ['required', { min: 3 }], icon: ['required'] },
    defaults: { count: 0 },
    search: text('titleEn', 'titleSw', 'id'),
    rowLabel: (r, c) => bi(r, 'title', c),
    filters: [],
  },

  countries: {
    key: 'countries',
    load: load(countries.map((c) => ({ id: c.id, nameEn: c.name.en, nameSw: c.name.sw, count: innovations.filter((i) => i.countryId === c.id).length }))),
    columns: [
      { key: 'title', cell: (r, c) => bi(r, 'name', c) },
      { key: 'slug', cell: (r) => r.id },
      { key: 'count', cell: (r) => r.count },
    ],
    fields: () => [{ name: 'nameEn', labelKey: 'admin.fields.nameEn' }, { name: 'nameSw', labelKey: 'admin.fields.nameSw' }],
    rules: { nameEn: ['required', { min: 2 }], nameSw: ['required', { min: 2 }] },
    defaults: { count: 0 },
    search: text('nameEn', 'nameSw', 'id'),
    rowLabel: (r, c) => bi(r, 'name', c),
    filters: [],
  },

  articles: {
    key: 'articles',
    load: load(knowledgeItems.map((a) => ({ id: a.id, titleEn: a.title.en, titleSw: a.title.sw, type: a.type, status: 'published' }))),
    columns: [
      { key: 'title', cell: (r, c) => bi(r, 'title', c) },
      { key: 'type', cell: (r, { t }) => t(`research.types.${r.type}`) },
      { key: 'status', cell: statusCell },
    ],
    fields: (c) => [
      { name: 'titleEn', labelKey: 'admin.fields.titleEn' }, { name: 'titleSw', labelKey: 'admin.fields.titleSw' },
      { name: 'type', labelKey: 'admin.fields.type', type: 'select', options: ['summary', 'caseStudy', 'cropGuide', 'livestockGuide', 'climate', 'implementation'].map((k) => ({ value: k, label: c.t(`research.types.${k}`) })) },
      { name: 'status', labelKey: 'admin.fields.status', type: 'select', options: statusOptions(['published', 'draft', 'review'])(c) },
    ],
    rules: { titleEn: ['required', { min: 3 }], titleSw: ['required', { min: 3 }], type: ['required'], status: ['required'] },
    defaults: { status: 'draft' },
    search: text('titleEn', 'titleSw'),
    rowLabel: (r, c) => bi(r, 'title', c),
    filters: [
      { key: 'type', labelKey: 'admin.fields.type', options: ({ t }) => ['summary', 'caseStudy', 'cropGuide', 'livestockGuide', 'climate', 'implementation'].map((k) => ({ value: k, label: t(`research.types.${k}`) })) },
      { key: 'status', labelKey: 'admin.cols.status', options: statusOptions(['published', 'draft', 'review']) },
    ],
  },

  courses: {
    key: 'courses',
    load: load(courses.map((c) => ({ id: c.id, titleEn: c.title.en, titleSw: c.title.sw, level: c.level, weeks: String(c.weeks), status: 'draft' }))),
    columns: [
      { key: 'title', cell: (r, c) => bi(r, 'title', c) },
      { key: 'level', cell: (r, { t }) => t(`learning.level.${r.level}`) },
      { key: 'duration', cell: (r, { t }) => t('learning.duration', { n: r.weeks }) },
      { key: 'status', cell: statusCell },
    ],
    fields: (c) => [
      { name: 'titleEn', labelKey: 'admin.fields.titleEn' }, { name: 'titleSw', labelKey: 'admin.fields.titleSw' },
      { name: 'level', labelKey: 'admin.fields.level', type: 'select', options: courseLevels.map((l) => ({ value: l, label: c.t(`learning.level.${l}`) })) },
      { name: 'weeks', labelKey: 'admin.fields.weeks' },
      { name: 'status', labelKey: 'admin.fields.status', type: 'select', options: statusOptions(['published', 'draft', 'review'])(c) },
    ],
    rules: { titleEn: ['required', { min: 3 }], titleSw: ['required', { min: 3 }], level: ['required'], weeks: ['required'], status: ['required'] },
    defaults: { status: 'draft', weeks: '4' },
    search: text('titleEn', 'titleSw'),
    rowLabel: (r, c) => bi(r, 'title', c),
    filters: [{ key: 'level', labelKey: 'admin.fields.level', options: ({ t }) => courseLevels.map((l) => ({ value: l, label: t(`learning.level.${l}`) })) }],
  },

  experts: {
    key: 'experts',
    load: load(experts.map((e) => ({ id: e.id, name: e.name, countryId: e.countryId, areaEn: e.area.en, areaSw: e.area.sw, status: 'review' }))),
    columns: [
      { key: 'name', cell: (r) => r.name },
      { key: 'country', cell: (r, { loc }) => loc(countryById[r.countryId]?.name) },
      { key: 'area', cell: (r, c) => bi(r, 'area', c) },
      { key: 'status', cell: statusCell },
    ],
    fields: (c) => [
      { name: 'name', labelKey: 'admin.fields.name' },
      { name: 'countryId', labelKey: 'admin.fields.country', type: 'select', options: countryOptions(c) },
      { name: 'areaEn', labelKey: 'admin.fields.areaEn' }, { name: 'areaSw', labelKey: 'admin.fields.areaSw' },
      { name: 'status', labelKey: 'admin.fields.status', type: 'select', options: statusOptions(['published', 'draft', 'review'])(c) },
    ],
    rules: { name: ['required', { min: 2 }], countryId: ['required'], areaEn: ['required'], areaSw: ['required'], status: ['required'] },
    defaults: { status: 'review' },
    search: text('name', 'areaEn', 'areaSw'),
    rowLabel: (r) => r.name,
    filters: [{ key: 'status', labelKey: 'admin.cols.status', options: statusOptions(['published', 'draft', 'review']) }],
  },

  startups: {
    key: 'startups',
    load: load([
      ...startups.map((s) => ({ id: s.id, titleEn: s.name, titleSw: s.name, kind: 'startup', status: 'review' })),
      ...opportunities.map((o) => ({ id: o.id, titleEn: o.title.en, titleSw: o.title.sw, kind: 'opportunity', status: 'review' })),
      ...challenges.map((c) => ({ id: c.id, titleEn: c.title.en, titleSw: c.title.sw, kind: 'challenge', status: 'draft' })),
    ]),
    columns: [
      { key: 'title', cell: (r, c) => bi(r, 'title', c) },
      { key: 'kind', cell: (r, { t }) => t(`admin.kinds.${r.kind}`) },
      { key: 'status', cell: statusCell },
    ],
    fields: (c) => [
      { name: 'titleEn', labelKey: 'admin.fields.titleEn' }, { name: 'titleSw', labelKey: 'admin.fields.titleSw' },
      { name: 'kind', labelKey: 'admin.fields.kind', type: 'select', options: ['startup', 'opportunity', 'challenge'].map((k) => ({ value: k, label: c.t(`admin.kinds.${k}`) })) },
      { name: 'status', labelKey: 'admin.fields.status', type: 'select', options: statusOptions(['published', 'draft', 'review'])(c) },
    ],
    rules: { titleEn: ['required', { min: 3 }], titleSw: ['required', { min: 3 }], kind: ['required'], status: ['required'] },
    defaults: { status: 'draft', kind: 'startup' },
    search: text('titleEn', 'titleSw'),
    rowLabel: (r, c) => bi(r, 'title', c),
    filters: [{ key: 'kind', labelKey: 'admin.fields.kind', options: ({ t }) => ['startup', 'opportunity', 'challenge'].map((k) => ({ value: k, label: t(`admin.kinds.${k}`) })) }],
  },

  community: {
    key: 'community',
    load: load(discussions.map((d, i) => ({ id: d.id, titleEn: d.title.en, titleSw: d.title.sw, topic: d.topic, replies: d.replies.length, status: i === 1 || i === 5 ? 'pending' : 'approved' }))),
    columns: [
      { key: 'title', cell: (r, c) => bi(r, 'title', c) },
      { key: 'topic', cell: (r, { t }) => t(`community.topics.${r.topic}`) },
      { key: 'replies', cell: (r) => r.replies },
      { key: 'status', cell: statusCell },
    ],
    fields: (c) => [
      { name: 'titleEn', labelKey: 'admin.fields.titleEn' }, { name: 'titleSw', labelKey: 'admin.fields.titleSw' },
      { name: 'topic', labelKey: 'admin.fields.topic', type: 'select', options: discussionTopics.map((k) => ({ value: k, label: c.t(`community.topics.${k}`) })) },
      { name: 'status', labelKey: 'admin.fields.status', type: 'select', options: statusOptions(['pending', 'approved', 'rejected'])(c) },
    ],
    rules: { titleEn: ['required', { min: 3 }], titleSw: ['required', { min: 3 }], topic: ['required'], status: ['required'] },
    defaults: { status: 'pending', replies: 0 },
    search: text('titleEn', 'titleSw'),
    rowLabel: (r, c) => bi(r, 'title', c),
    extraActions: [
      { labelKey: 'admin.actions.approve', apply: (r) => ({ ...r, status: 'approved' }), when: (r) => r.status !== 'approved' },
      { labelKey: 'admin.actions.reject', apply: (r) => ({ ...r, status: 'rejected' }), when: (r) => r.status !== 'rejected' },
    ],
    filters: [{ key: 'status', labelKey: 'admin.cols.status', options: statusOptions(['pending', 'approved', 'rejected']) }],
  },

  users: {
    key: 'users',
    load: load(adminUsers),
    columns: [
      { key: 'name', cell: (r) => r.name },
      { key: 'email', cell: (r) => r.email },
      { key: 'role', cell: (r, { t }) => t(`roles.${r.role}`) },
      { key: 'status', cell: statusCell },
    ],
    fields: (c) => [
      { name: 'name', labelKey: 'admin.fields.name' },
      { name: 'email', labelKey: 'forms.email', type: 'email' },
      { name: 'role', labelKey: 'admin.fields.role', type: 'select', options: userRoles.map((r) => ({ value: r, label: c.t(`roles.${r}`) })) },
      { name: 'status', labelKey: 'admin.fields.status', type: 'select', options: statusOptions(['active', 'invited', 'suspended'])(c) },
    ],
    rules: { name: ['required', { min: 2 }], email: ['required', 'email'], role: ['required'], status: ['required'] },
    defaults: { status: 'invited', role: 'farmer' },
    search: text('name', 'email'),
    rowLabel: (r) => r.name,
    filters: [
      { key: 'role', labelKey: 'admin.fields.role', options: ({ t }) => userRoles.map((r) => ({ value: r, label: t(`roles.${r}`) })) },
      { key: 'status', labelKey: 'admin.cols.status', options: statusOptions(['active', 'invited', 'suspended']) },
    ],
  },

  media: {
    key: 'media',
    load: load(adminMedia),
    columns: [
      { key: 'preview', cell: (r) => <PatternTile tone={r.tone ?? 'a'} className="tile--thumb" /> },
      { key: 'filename', cell: (r) => r.filename },
      { key: 'type', cell: (r, { t }) => t(`admin.mediaTypes.${r.type}`) },
      { key: 'size', cell: (r) => r.size },
    ],
    fields: (c) => [
      { name: 'filename', labelKey: 'admin.fields.filename' },
      { name: 'type', labelKey: 'admin.fields.type', type: 'select', options: ['image', 'document', 'video', 'archive'].map((k) => ({ value: k, label: c.t(`admin.mediaTypes.${k}`) })) },
      { name: 'size', labelKey: 'admin.fields.size' },
    ],
    rules: { filename: ['required', { min: 3 }], type: ['required'], size: ['required'] },
    defaults: { type: 'image', size: '0 KB', tone: 'a' },
    search: text('filename'),
    rowLabel: (r) => r.filename,
    filters: [{ key: 'type', labelKey: 'admin.fields.type', options: ({ t }) => ['image', 'document', 'video', 'archive'].map((k) => ({ value: k, label: t(`admin.mediaTypes.${k}`) })) }],
  },

  messages: {
    key: 'messages',
    load: load(adminMessages.map((m) => ({ id: m.id, name: m.name, email: m.email, subjectEn: m.subject.en, subjectSw: m.subject.sw, bodyEn: m.body.en, bodySw: m.body.sw, status: m.status }))),
    canAdd: false, canEdit: false, viewable: true,
    columns: [
      { key: 'from', cell: (r) => r.name },
      { key: 'email', cell: (r) => r.email },
      { key: 'subject', cell: (r, c) => bi(r, 'subject', c) },
      { key: 'status', cell: statusCell },
    ],
    renderDetail: (r, c) => (
      <>
        <p><strong>{r.name}</strong> ({r.email})</p>
        <p>{bi(r, 'body', c)}</p>
        <p className="muted small">{c.t('admin.messageNote')}</p>
      </>
    ),
    extraActions: [{ labelKey: 'admin.actions.markRead', apply: (r) => ({ ...r, status: 'read' }), when: (r) => r.status === 'new' }],
    search: text('name', 'email', 'subjectEn', 'subjectSw', 'bodyEn', 'bodySw'),
    rowLabel: (r, c) => bi(r, 'subject', c),
    filters: [{ key: 'status', labelKey: 'admin.cols.status', options: statusOptions(['new', 'read', 'replied']) }],
  },

  notifications: {
    key: 'notifications',
    load: load(adminNotifications.map((n) => ({ id: n.id, titleEn: n.title.en, titleSw: n.title.sw, audience: n.audience, status: n.status }))),
    columns: [
      { key: 'title', cell: (r, c) => bi(r, 'title', c) },
      { key: 'audience', cell: (r, { t }) => (r.audience === 'all' ? t('admin.audienceAll') : t(`roles.${r.audience}`)) },
      { key: 'status', cell: statusCell },
    ],
    fields: (c) => [
      { name: 'titleEn', labelKey: 'admin.fields.titleEn' }, { name: 'titleSw', labelKey: 'admin.fields.titleSw' },
      { name: 'audience', labelKey: 'admin.fields.audience', type: 'select', options: [{ value: 'all', label: c.t('admin.audienceAll') }, ...userRoles.map((r) => ({ value: r, label: c.t(`roles.${r}`) }))] },
      { name: 'status', labelKey: 'admin.fields.status', type: 'select', options: statusOptions(['draft', 'ready'])(c) },
    ],
    rules: { titleEn: ['required', { min: 3 }], titleSw: ['required', { min: 3 }], audience: ['required'], status: ['required'] },
    defaults: { status: 'draft', audience: 'all' },
    search: text('titleEn', 'titleSw'),
    rowLabel: (r, c) => bi(r, 'title', c),
    filters: [{ key: 'status', labelKey: 'admin.cols.status', options: statusOptions(['draft', 'ready']) }],
  },

  seo: {
    key: 'seo',
    load: load(seoPages),
    columns: [
      { key: 'page', cell: (r) => r.page },
      { key: 'title', cell: (r, c) => bi(r, 'title', c) },
      { key: 'description', cell: (r, c) => bi(r, 'desc', c) },
    ],
    fields: () => [
      { name: 'page', labelKey: 'admin.fields.page' },
      { name: 'titleEn', labelKey: 'admin.fields.titleEn', hintKey: 'admin.seoTitleHint' }, { name: 'titleSw', labelKey: 'admin.fields.titleSw' },
      { name: 'descEn', labelKey: 'admin.fields.descEn', type: 'textarea', hintKey: 'admin.seoDescHint' }, { name: 'descSw', labelKey: 'admin.fields.descSw', type: 'textarea' },
    ],
    rules: {
      page: ['required'], titleEn: ['required', { max: 60 }], titleSw: ['required', { max: 60 }],
      descEn: ['required', { max: 160 }], descSw: ['required', { max: 160 }],
    },
    defaults: {},
    search: text('page', 'titleEn', 'titleSw', 'descEn', 'descSw'),
    rowLabel: (r) => r.page,
    filters: [],
  },
};

export const adminSections = [
  { to: '/admin', key: 'overview', end: true },
  { to: '/admin/innovations', key: 'innovations' },
  { to: '/admin/categories', key: 'categories' },
  { to: '/admin/countries', key: 'countries' },
  { to: '/admin/articles', key: 'articles' },
  { to: '/admin/courses', key: 'courses' },
  { to: '/admin/experts', key: 'experts' },
  { to: '/admin/startups', key: 'startups' },
  { to: '/admin/community', key: 'community' },
  { to: '/admin/users', key: 'users' },
  { to: '/admin/media', key: 'media' },
  { to: '/admin/messages', key: 'messages' },
  { to: '/admin/notifications', key: 'notifications' },
  { to: '/admin/seo', key: 'seo' },
  { to: '/admin/settings', key: 'settings' },
];
