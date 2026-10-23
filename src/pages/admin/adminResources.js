// Declarative description of every managed resource: which table, how to search it, what the form contains and how
// form values convert to and from database rows. The generic AdminTable and AdminForm render from these specs.
// Field kinds: text | slug | int | date | select | bi (en/sw text) | bitext (en/sw textarea) | bilist (en/sw lines) | tags.

const status = { name: 'status', kind: 'select', options: ['draft', 'published', 'archived'], optionKey: 'adm.status', required: true, default: 'draft' };
const sectors = ['crop', 'livestock'];

export const adminResources = {
  innovations: {
    table: 'innovations', searchColumn: 'search_text', statusColumn: 'status', publishable: true, titleOf: (r, loc) => loc(r.title),
    columns: ['title', 'country_id', 'category_id', 'status'],
    fields: [
      { name: 'slug', kind: 'slug', required: true, createOnly: true },
      { name: 'sector', kind: 'select', options: sectors, optionKey: 'adm.sector', required: true, default: 'crop' },
      { name: 'country_id', kind: 'select', source: 'countries', required: true },
      { name: 'category_id', kind: 'select', source: 'categories', required: true },
      { name: 'application_ids', kind: 'tags' },
      { name: 'title', kind: 'bi', required: true }, { name: 'summary', kind: 'bitext', required: true },
      { name: 'benefits', kind: 'bilist' }, { name: 'considerations', kind: 'bilist' },
      { name: 'added_on', kind: 'date', required: true }, status,
    ],
  },
  categories: {
    table: 'categories', pk: 'id', searchColumn: null, order: [['sort_order', true], ['id', true]], titleOf: (r, loc) => loc(r.title),
    columns: ['id', 'title', 'icon', 'sort_order'],
    fields: [
      { name: 'id', kind: 'slug', required: true, createOnly: true }, { name: 'icon', kind: 'text', required: true, default: 'leaf' },
      { name: 'title', kind: 'bi', required: true }, { name: 'blurb', kind: 'bitext' }, { name: 'consider', kind: 'bitext' },
      { name: 'application_ids', kind: 'tags' }, { name: 'sort_order', kind: 'int', default: 0 },
    ],
  },
  countries: {
    table: 'countries', pk: 'id', searchColumn: null, order: [['sort_order', true], ['id', true]], titleOf: (r, loc) => loc(r.name),
    columns: ['id', 'name', 'tone', 'sort_order'],
    fields: [
      { name: 'id', kind: 'slug', required: true, createOnly: true }, { name: 'tone', kind: 'text', required: true, default: 'a' },
      { name: 'name', kind: 'bi', required: true }, { name: 'description', kind: 'bitext' }, { name: 'sort_order', kind: 'int', default: 0 },
    ],
  },
  articles: {
    table: 'articles', searchColumn: 'search_text', statusColumn: 'status', publishable: true, titleOf: (r, loc) => loc(r.title),
    columns: ['title', 'type', 'published_on', 'status'],
    fields: [
      { name: 'slug', kind: 'slug', required: true, createOnly: true },
      { name: 'type', kind: 'select', options: ['summary', 'caseStudy', 'cropGuide', 'livestockGuide', 'climate', 'implementation'], optionKey: 'research.types', required: true, default: 'summary' },
      { name: 'sector', kind: 'select', options: ['crop', 'livestock', 'both'], optionKey: 'adm.sector', required: true, default: 'both' },
      { name: 'category_ids', kind: 'tags' }, { name: 'title', kind: 'bi', required: true }, { name: 'summary', kind: 'bitext', required: true },
      { name: 'body', kind: 'bilist' }, { name: 'minutes', kind: 'int', required: true, default: 3, min: 1, max: 120 },
      { name: 'published_on', kind: 'date', required: true }, status,
    ],
  },
  courses: {
    table: 'courses', searchColumn: 'search_text', statusColumn: 'status', publishable: true, titleOf: (r, loc) => loc(r.title),
    columns: ['title', 'level', 'weeks', 'status'],
    fields: [
      { name: 'slug', kind: 'slug', required: true, createOnly: true },
      { name: 'level', kind: 'select', options: ['beginner', 'intermediate', 'advanced'], optionKey: 'learning.level', required: true, default: 'beginner' },
      { name: 'weeks', kind: 'int', required: true, default: 4, min: 1, max: 104 }, { name: 'icon', kind: 'text', required: true, default: 'book' },
      { name: 'topic', kind: 'select', options: ['crop', 'livestock', 'technology', 'climate', 'business', 'digital'], optionKey: 'adm.topic', required: true, default: 'crop' },
      { name: 'related_category_id', kind: 'select', source: 'categories' },
      { name: 'title', kind: 'bi', required: true }, { name: 'description', kind: 'bitext', required: true }, { name: 'modules', kind: 'bilist' }, status,
    ],
  },
  experts: {
    table: 'experts', searchColumn: 'search_text', statusColumn: 'status', publishable: true, titleOf: (r) => r.name,
    columns: ['name', 'area', 'country_id', 'status'],
    fields: [
      { name: 'slug', kind: 'slug', required: true, createOnly: true }, { name: 'name', kind: 'text', required: true, max: 120 },
      { name: 'country_id', kind: 'select', source: 'countries', required: true },
      { name: 'area', kind: 'select', options: ['irrigation', 'greenhouse', 'soil', 'livestock', 'extension', 'mechanization'], optionKey: 'adm.area', required: true, default: 'irrigation' },
      { name: 'area_label', kind: 'bi', required: true }, { name: 'bio', kind: 'bitext', required: true }, { name: 'expertise', kind: 'bilist' },
      { name: 'initial', kind: 'text', required: true, max: 1, default: 'A' }, status,
    ],
  },
  startups: {
    table: 'startups', searchColumn: 'search_text', statusColumn: 'status', publishable: true, titleOf: (r) => r.name,
    columns: ['name', 'stage', 'country_id', 'status'],
    fields: [
      { name: 'slug', kind: 'slug', required: true, createOnly: true }, { name: 'name', kind: 'text', required: true, max: 120 },
      { name: 'country_id', kind: 'select', source: 'countries', required: true }, { name: 'category_id', kind: 'select', source: 'categories', required: true },
      { name: 'stage', kind: 'select', options: ['early', 'growing', 'established'], optionKey: 'adm.stage', required: true, default: 'early' },
      { name: 'description', kind: 'bitext', required: true }, { name: 'solutions', kind: 'bilist' }, { name: 'needs', kind: 'bilist' },
      { name: 'letter', kind: 'text', required: true, max: 1, default: 'A' }, status,
    ],
  },
  organizations: {
    table: 'organizations', searchColumn: null, statusColumn: 'status', publishable: true, titleOf: (r, loc) => loc(r.name),
    columns: ['name', 'org_type', 'country_id', 'status'],
    fields: [
      { name: 'slug', kind: 'slug', required: true, createOnly: true },
      { name: 'org_type', kind: 'select', options: ['cooperative', 'university', 'ngo', 'agency'], optionKey: 'partnerships.kind', required: true, default: 'cooperative' },
      { name: 'country_id', kind: 'select', source: 'countries', required: true },
      { name: 'name', kind: 'bi', required: true }, { name: 'summary', kind: 'bitext', required: true }, status,
    ],
  },
  partnerships: {
    table: 'partnerships', searchColumn: null, statusColumn: 'status', publishable: true, titleOf: (r, loc) => loc(r.title),
    columns: ['title', 'kind', 'phase', 'status'],
    fields: [
      { name: 'slug', kind: 'slug', required: true, createOnly: true },
      { name: 'kind', kind: 'select', options: ['opportunity', 'challenge'], optionKey: 'adm.partnershipKind', required: true, default: 'opportunity' },
      { name: 'subtype', kind: 'select', options: ['pilot', 'research', 'training', 'funding', 'distribution'], optionKey: 'adm.subtype' },
      { name: 'topic', kind: 'select', options: ['storage', 'herd', 'advisory'], optionKey: 'adm.topicChallenge' },
      { name: 'phase', kind: 'select', options: ['open', 'planned', 'closed'], optionKey: 'adm.phase', required: true, default: 'open' },
      { name: 'title', kind: 'bi', required: true }, { name: 'summary', kind: 'bitext', required: true }, status,
    ],
  },
  // Moderation: administrators hide, restore or remove posts. They do not edit what members wrote.
  community: {
    table: 'discussions', searchColumn: 'search_text', statusColumn: 'status', publishable: true, moderationOnly: true, titleOf: (r, loc) => loc(r.title),
    columns: ['title', 'topic', 'posted_on', 'status'], fields: [],
  },
  submissions: {
    table: 'content_submissions', searchColumn: null, statusColumn: 'status', statusValues: ['pending', 'approved', 'rejected'], reviewOnly: true, titleOf: (r) => r.title,
    columns: ['title', 'kind', 'organization', 'status'],
    fields: [{ name: 'status', kind: 'select', options: ['pending', 'approved', 'rejected'], optionKey: 'adm.reviewStatus', required: true }, { name: 'admin_note', kind: 'text', max: 1000 }],
  },
  messages: {
    table: 'contact_messages', searchColumn: null, statusColumn: 'status', statusValues: ['new', 'read', 'archived'], reviewOnly: true, titleOf: (r) => r.subject,
    columns: ['subject', 'name', 'reason', 'status'],
    fields: [{ name: 'status', kind: 'select', options: ['new', 'read', 'archived'], optionKey: 'adm.messageStatus', required: true }],
  },
};

const BI = (v) => (v && typeof v === 'object' ? v : { en: '', sw: '' });

// Database row -> flat form values.
export function rowToForm(resource, row) {
  const values = {};
  for (const f of resource.fields) {
    const v = row?.[f.name];
    if (f.kind === 'bi' || f.kind === 'bitext') { values[`${f.name}__en`] = BI(v).en ?? ''; values[`${f.name}__sw`] = BI(v).sw ?? ''; }
    else if (f.kind === 'bilist') { const asList = (x) => (Array.isArray(x) ? x : []); values[`${f.name}__en`] = asList(BI(v).en).join('\n'); values[`${f.name}__sw`] = asList(BI(v).sw).join('\n'); }
    else if (f.kind === 'tags') values[f.name] = (v ?? []).join(', ');
    else if (f.kind === 'date') values[f.name] = v ?? new Date().toISOString().slice(0, 10);
    else values[f.name] = v ?? f.default ?? '';
  }
  return values;
}

const lines = (s) => String(s ?? '').split('\n').map((x) => x.trim()).filter(Boolean);

// Flat form values -> database row (only columns declared in the spec).
export function formToRow(resource, values, { creating }) {
  const row = {};
  for (const f of resource.fields) {
    if (f.createOnly && !creating) continue;
    if (f.kind === 'bi' || f.kind === 'bitext') row[f.name] = { en: String(values[`${f.name}__en`] ?? '').trim(), sw: String(values[`${f.name}__sw`] ?? '').trim() };
    else if (f.kind === 'bilist') row[f.name] = { en: lines(values[`${f.name}__en`]), sw: lines(values[`${f.name}__sw`]) };
    else if (f.kind === 'tags') row[f.name] = String(values[f.name] ?? '').split(',').map((x) => x.trim()).filter(Boolean);
    else if (f.kind === 'int') row[f.name] = values[f.name] === '' || values[f.name] == null ? null : Number(values[f.name]);
    else {
      const v = String(values[f.name] ?? '').trim();
      row[f.name] = v === '' ? null : v;
    }
  }
  return row;
}

// Validation shared by the form and by tests. Returns { fieldKey: errorKey | {key, vars} }.
export function validateForm(resource, values, { creating }) {
  const errors = {};
  const need = (k) => { errors[k] = 'ui.errors.required'; };
  for (const f of resource.fields) {
    if (f.createOnly && !creating) continue;
    const keys = ['bi', 'bitext', 'bilist'].includes(f.kind) ? [`${f.name}__en`, `${f.name}__sw`] : [f.name];
    for (const k of keys) {
      const v = String(values[k] ?? '').trim();
      if (f.required && !v && f.kind !== 'bilist') { need(k); continue; }
      if (f.kind === 'slug' && v && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) errors[k] = 'adm.errors.slug';
      if (f.kind === 'int' && v && (!Number.isInteger(Number(v)) || (f.min != null && Number(v) < f.min) || (f.max != null && Number(v) > f.max))) errors[k] = 'adm.errors.number';
      if (f.kind === 'date' && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) errors[k] = 'adm.errors.date';
      if (f.max && v.length > f.max && f.kind === 'text') errors[k] = { key: 'ui.errors.max', vars: { n: f.max } };
    }
  }
  return errors;
}

// Fields shown in the read-only detail dialog for resources that administrators review rather than edit.
adminResources.messages.viewFields = ['name', 'email', 'reason', 'subject', 'message', 'created_at'];
adminResources.submissions.viewFields = ['title', 'kind', 'organization', 'country_id', 'category_id', 'description', 'contact_email', 'admin_note', 'created_at'];
adminResources.community.viewFields = ['title', 'body', 'author_name', 'topic', 'kind', 'posted_on'];
