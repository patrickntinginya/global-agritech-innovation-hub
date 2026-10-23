// Database rows -> the view models the Phase 1 pages already read. Pages keep using `id` = slug.
const bi = (v) => (v && typeof v === 'object' ? v : { en: String(v ?? ''), sw: String(v ?? '') });
const authorOf = (r) => r.author_label ?? bi(r.author_name || 'Member');

export const mapInnovation = (r) => ({
  id: r.slug, uuid: r.id, sector: r.sector, countryId: r.country_id, categoryId: r.category_id,
  applications: r.application_ids ?? [], added: r.added_on, title: r.title, summary: r.summary,
  benefits: r.benefits, considerations: r.considerations, isSample: r.is_sample, status: r.status,
});

export const mapArticle = (r) => ({
  id: r.slug, uuid: r.id, type: r.type, sector: r.sector, date: r.published_on, categoryIds: r.category_ids ?? [],
  title: r.title, summary: r.summary, body: r.body, minutes: r.minutes, isSample: r.is_sample, status: r.status,
});

export const mapCourse = (r) => ({
  id: r.slug, uuid: r.id, level: r.level, weeks: r.weeks, icon: r.icon, category: r.topic, topic: r.topic,
  sector: r.topic === 'livestock' ? 'livestock' : 'crop', relatedCategoryId: r.related_category_id,
  categoryIds: r.related_category_id ? [r.related_category_id] : [], title: r.title, description: r.description,
  modules: r.modules, isSample: r.is_sample, status: r.status,
});

export const mapExpert = (r) => ({
  id: r.slug, uuid: r.id, name: r.name, countryId: r.country_id, area: r.area, areaLabel: r.area_label, title: r.area_label,
  bio: r.bio, expertise: r.expertise, initial: r.initial, isSample: r.is_sample, status: r.status,
});

export const mapStartup = (r) => ({
  id: r.slug, uuid: r.id, name: r.name, countryId: r.country_id, categoryId: r.category_id, focus: r.category_id,
  stage: r.stage, description: r.description, summary: r.description, solutions: r.solutions, needs: r.needs,
  letter: r.letter, innovationIds: [], isSample: r.is_sample, status: r.status,
});

export const mapOrganization = (r) => ({
  id: r.slug, uuid: r.id, type: r.org_type, kind: r.org_type, countryId: r.country_id, name: r.name, summary: r.summary,
  isSample: r.is_sample, status: r.status,
});

export const mapOpportunity = (r) => ({
  id: r.slug, uuid: r.id, type: r.subtype, kind: r.subtype, status: r.phase, title: r.title, summary: r.summary, isSample: r.is_sample,
});

export const mapChallenge = (r) => ({
  id: r.slug, uuid: r.id, categoryId: r.topic, status: r.phase, title: r.title, summary: r.summary, isSample: r.is_sample,
});

export const mapReply = (r) => ({
  id: r.id, authorId: r.author_id ?? null, author: authorOf(r), accepted: Boolean(r.accepted), text: r.body, isSample: r.is_sample, date: r.created_at,
});

export const mapDiscussion = (r) => {
  const replies = (r.discussion_replies ?? []).filter((x) => x.status == null || x.status === 'published').map((x) => (x.body ? mapReply(x) : { id: x.id, accepted: Boolean(x.accepted) }));
  return {
    id: r.slug, uuid: r.id, authorId: r.author_id ?? null, kind: r.kind, topic: r.topic, date: r.posted_on, author: authorOf(r),
    answered: replies.some((x) => x.accepted), title: r.title, body: r.body, replies, isSample: r.is_sample, status: r.status,
  };
};

export const mapNotification = (r) => ({
  id: r.id, kind: r.kind, title: r.title, body: r.body, link: r.link, read: Boolean(r.read_at), createdAt: r.created_at,
});

export const mapSubmission = (r) => ({
  id: r.id, kind: r.kind, title: r.title, organization: r.organization, countryId: r.country_id, categoryId: r.category_id,
  description: r.description, status: r.status, adminNote: r.admin_note, createdAt: r.created_at,
});

export const mapProfile = (r) => ({
  id: r.id, displayName: r.display_name, country: r.country ?? '', role: r.account_type ?? '', bio: r.bio ?? '',
  interests: r.interests ?? [], language: r.language,
  notify: { content: r.notify_content, community: r.notify_community, learning: r.notify_learning },
});
