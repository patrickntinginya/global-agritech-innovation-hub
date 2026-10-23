import test from 'node:test';
import assert from 'node:assert/strict';
import { useFake } from '../support/helpers.mjs';
import { setClientForTesting } from '../../src/lib/supabase.js';
import { ServiceError } from '../../src/services/errors.js';
import * as innovations from '../../src/services/innovationService.js';
import * as content from '../../src/services/contentService.js';

test('queryInnovations paginates in the database and reports totals', async () => {
  useFake();
  const p1 = await innovations.queryInnovations({ pageSize: 6, page: 1 });
  assert.equal(p1.total, 17);
  assert.equal(p1.pageCount, 3);
  assert.equal(p1.items.length, 6);
  const p3 = await innovations.queryInnovations({ pageSize: 6, page: 3 });
  assert.equal(p3.items.length, 5);
  const ids = new Set([...p1.items, ...p3.items, ...(await innovations.queryInnovations({ pageSize: 6, page: 2 })).items].map((i) => i.id));
  assert.equal(ids.size, 17, 'pages must not overlap or skip rows');
});

test('queryInnovations clamps an out-of-range page to the last page', async () => {
  useFake();
  const r = await innovations.queryInnovations({ pageSize: 6, page: 99 });
  assert.equal(r.page, 3);
  assert.equal(r.items.length, 5);
});

test('queryInnovations filters by category, country, sector, application and keyword; "all" means no filter', async () => {
  useFake();
  const all = await innovations.queryInnovations({ category: 'all', country: 'all', sector: 'all', pageSize: 50 });
  assert.equal(all.total, 17);
  const byCat = await innovations.queryInnovations({ categoryId: 'smart-irrigation', pageSize: 50 });
  assert.ok(byCat.total >= 1 && byCat.items.every((i) => i.categoryId === 'smart-irrigation'));
  const byCountry = await innovations.queryInnovations({ countryId: 'israel', pageSize: 50 });
  assert.ok(byCountry.items.every((i) => i.countryId === 'israel'));
  const live = await innovations.queryInnovations({ sector: 'livestock', pageSize: 50 });
  assert.ok(live.total >= 1 && live.items.every((i) => i.sector === 'livestock'));
  const app = await innovations.queryInnovations({ application: 'water', pageSize: 50 });
  assert.ok(app.items.every((i) => i.applications.includes('water')));
  const kw = await innovations.queryInnovations({ q: 'drone', pageSize: 50 });
  assert.ok(kw.total >= 1 && kw.total < 17);
});

test('queryInnovations: empty results are a valid, empty page; LIKE wildcards are matched literally', async () => {
  useFake();
  const none = await innovations.queryInnovations({ q: 'zzzqqq' });
  assert.deepEqual([none.total, none.pageCount, none.items.length], [0, 1, 0]);
  assert.equal((await innovations.queryInnovations({ q: '%' })).total, 0, '% must not match everything');
  assert.equal((await innovations.queryInnovations({ q: '_' })).total, 0, '_ must not match everything');
});

test('queryInnovations sorts alphabetically and by newest', async () => {
  useFake();
  const alpha = (await innovations.queryInnovations({ sort: 'alpha', pageSize: 50 })).items.map((i) => i.title.en);
  assert.deepEqual(alpha, [...alpha].sort((a, b) => a.localeCompare(b)));
  const newest = (await innovations.queryInnovations({ sort: 'newest', pageSize: 50 })).items.map((i) => i.added);
  assert.deepEqual(newest, [...newest].sort().reverse());
});

test('detail lookups: unknown slug returns null, known slug returns the Phase 1 shape', async () => {
  useFake();
  assert.equal(await innovations.getInnovation('does-not-exist'), null);
  const one = await innovations.getInnovation('solar-drip-kit');
  assert.equal(one.id, 'solar-drip-kit');
  assert.ok(one.title.en && one.title.sw && Array.isArray(one.benefits.en));
  assert.ok((await innovations.listRelatedInnovations('solar-drip-kit', 3)).length <= 3);
  assert.deepEqual(await innovations.listRelatedInnovations('nope'), []);
});

test('drafts and archived records never reach public queries, even for a signed-in administrator', async () => {
  const { fake, signIn } = useFake({ admins: ['boss@example.com'] });
  await signIn('boss@example.com', { admin: true });
  fake.__tables.innovations[0].status = 'draft';
  fake.__tables.innovations[1].status = 'archived';
  const [draft, archived] = fake.__tables.innovations.slice(0, 2).map((r) => r.slug);
  assert.equal((await innovations.queryInnovations({ pageSize: 50 })).total, 15);
  assert.equal(await innovations.getInnovation(draft), null);
  assert.equal(await innovations.getInnovation(archived), null);
  assert.equal((await innovations.listInnovations()).length, 15);
  assert.equal(await content.getArticle('k1') !== null, true);
  fake.__tables.articles[0].status = 'draft';
  assert.equal(await content.getArticle(fake.__tables.articles[0].slug), null);
});

test('content services return published rows with the Phase 1 view-model shapes', async () => {
  useFake();
  const articles = await content.queryArticles({ pageSize: 3 });
  assert.equal(articles.total, 8);
  assert.equal(articles.pageCount, 3);
  assert.equal(articles.items.length, 3);
  assert.ok(articles.items[0].id && articles.items[0].categoryIds && articles.items[0].body.en);
  const cases = await content.queryArticles({ type: 'caseStudy', pageSize: 10 });
  assert.ok(cases.items.every((a) => a.type === 'caseStudy'));
  const courses = await content.listCourses({ level: 'beginner' });
  assert.ok(courses.length >= 1 && courses.every((c) => c.level === 'beginner' && c.topic && c.sector));
  assert.ok((await content.listExperts()).every((e) => e.title && e.areaLabel));
  const threads = await content.listDiscussions({});
  assert.ok(threads.length >= 1 && threads.every((d) => Array.isArray(d.replies) && d.author));
  assert.ok((await content.getDiscussion('d1')).replies.length >= 1);
  const startup = await content.getStartup('s1');
  assert.ok(Array.isArray(startup.innovationIds) && startup.needs.en.length >= 1);
  const partnerships = await content.listPartnerships();
  assert.ok(partnerships.opportunities.length && partnerships.challenges.length && partnerships.organizations.length);
  assert.equal(await content.getCourse('nope'), null);
  assert.equal(await content.getDiscussion('nope'), null);
});

test('searchAll ignores very short queries, finds matches, and returns an empty group set for no match', async () => {
  useFake();
  const short = await content.searchAll('a');
  assert.deepEqual(Object.values(short).map((v) => v.length), [0, 0, 0, 0, 0]);
  const drip = await content.searchAll('drip');
  assert.ok(drip.innovations.length >= 1);
  const none = await content.searchAll('zzzqqq');
  assert.deepEqual(Object.values(none).map((v) => v.length), [0, 0, 0, 0, 0]);
});

test('backend failures surface as typed ServiceErrors, never as empty success', async () => {
  const { fake } = useFake();
  fake.__state.failNext = { code: '42501', message: 'permission denied for table innovations' };
  await assert.rejects(() => innovations.listInnovations(), (e) => e instanceof ServiceError && e.code === 'permission_denied');
  fake.__state.failNext = { code: 'PGRST301', message: 'JWT expired' };
  await assert.rejects(() => content.listCourses(), (e) => e.code === 'session_expired');
  fake.__state.failNext = { code: '22P02', message: 'invalid input syntax' };
  await assert.rejects(() => content.listExperts(), (e) => e.code === 'validation');
});

test('an unconfigured build reports not_configured instead of pretending to work', async () => {
  setClientForTesting(null);
  await assert.rejects(() => innovations.listInnovations(), (e) => e instanceof ServiceError && e.code === 'not_configured');
});
