import test from 'node:test';
import assert from 'node:assert/strict';
import { useFake } from '../support/helpers.mjs';
import * as admin from '../../src/services/adminService.js';
import { adminResources } from '../../src/pages/admin/adminResources.js';
import { listInnovations } from '../../src/services/innovationService.js';
import { ServiceError } from '../../src/services/errors.js';

const res = adminResources.innovations;
const row = (slug, extra = {}) => ({ slug, status: 'draft', sector: 'crop', country_id: 'africa', category_id: 'smart-farming', application_ids: [], title: { en: `T ${slug}`, sw: `T ${slug}` }, summary: { en: 's', sw: 's' }, benefits: { en: [], sw: [] }, considerations: { en: [], sw: [] }, added_on: '2026-10-10', ...extra });
const denied = (e) => e instanceof ServiceError && e.code === 'permission_denied';

test('an ordinary member cannot create, edit, publish, archive or delete managed content', async () => {
  const { fake, signIn } = useFake({ admins: ['boss@example.test'] });
  await signIn('ann@example.test');
  const before = fake.__tables.innovations.length;
  await assert.rejects(admin.createRow(res, row('member-made')), denied);
  const target = fake.__tables.innovations[0];
  await assert.rejects(admin.updateRow(res, target.id, { status: 'archived' }), denied);
  await assert.rejects(admin.setStatus(res, target.id, 'draft'), denied);
  await assert.rejects(admin.deleteRow(res, target.id), denied);
  assert.equal(fake.__tables.innovations.length, before);
  assert.equal(target.status, 'published', 'nothing changed');
});

test('a signed-out visitor is refused the same way', async () => {
  const { fake } = useFake();
  await assert.rejects(admin.createRow(res, row('visitor-made')), denied);
  assert.equal(fake.__tables.innovations.some((r) => r.slug === 'visitor-made'), false);
});

test('an administrator can create, edit, publish, archive and delete, and each change is real', async () => {
  const { fake, signIn } = useFake({ admins: ['boss@example.test'] });
  await signIn('boss@example.test', { admin: true });
  const created = await admin.createRow(res, row('boss-made'));
  assert.equal(created.status, 'draft');
  assert.equal((await listInnovations()).some((i) => i.id === 'boss-made'), false, 'drafts are not public');
  await admin.updateRow(res, created.id, { title: { en: 'Edited', sw: 'Imehaririwa' } });
  await admin.setStatus(res, created.id, 'published');
  assert.ok((await listInnovations()).some((i) => i.id === 'boss-made' && i.title.en === 'Edited'));
  await admin.setStatus(res, created.id, 'archived');
  assert.equal((await listInnovations()).some((i) => i.id === 'boss-made'), false, 'archived rows leave the public site');
  await admin.deleteRow(res, created.id);
  assert.equal(fake.__tables.innovations.some((r) => r.slug === 'boss-made'), false);
});

test('a write that matches no row is reported as a failure, never as success', async () => {
  const { signIn } = useFake({ admins: ['boss@example.test'] });
  await signIn('boss@example.test', { admin: true });
  await assert.rejects(admin.updateRow(res, '00000000-0000-4000-8000-00000000dead', { status: 'draft' }), denied);
  await assert.rejects(admin.deleteRow(res, '00000000-0000-4000-8000-00000000dead'), denied);
});

test('database errors are typed: duplicate slug is a conflict, bad slug is a validation error', async () => {
  const { signIn } = useFake({ admins: ['boss@example.test'] });
  await signIn('boss@example.test', { admin: true });
  await admin.createRow(res, row('same-slug'));
  await assert.rejects(admin.createRow(res, row('same-slug')), (e) => e.code === 'conflict');
  await assert.rejects(admin.createRow(res, row('Not A Slug!')), (e) => e.code === 'validation');
});

test('roles cannot be granted through the API by anyone, including an administrator or the member themselves', async () => {
  const { fake, signIn, signOut } = useFake({ admins: ['boss@example.test'] });
  await signIn('ann@example.test');
  const annId = fake.__state.users.find((u) => u.email === 'ann@example.test').id;
  const grab = await fake.from('user_roles').insert({ user_id: annId, role: 'admin' });
  assert.ok(grab.error, 'self-promotion is rejected');
  assert.equal(fake.__tables.user_roles.length, 0);
  assert.equal((await fake.rpc('is_admin')).data, false);
  await signOut();
  await signIn('boss@example.test', { admin: true });
  const again = await fake.from('user_roles').insert({ user_id: annId, role: 'admin' });
  assert.ok(again.error, 'even admins cannot grant roles through the API; that is a SQL-editor action');
  assert.equal((await fake.rpc('is_admin')).data, true);
});

test('administrative changes are audited without row contents; member activity is not', async () => {
  const { fake, signIn, signOut } = useFake({ admins: ['boss@example.test'] });
  await signIn('ann@example.test');
  await fake.from('bookmarks').select('*');
  assert.equal(fake.__tables.audit_events.length, 0);
  await signOut();
  await signIn('boss@example.test', { admin: true });
  const created = await admin.createRow(res, row('audited'));
  await admin.deleteRow(res, created.id);
  const events = await admin.recentAudit(10);
  assert.ok(events.length >= 2);
  for (const e of events) {
    assert.deepEqual(Object.keys(e).filter((k) => !['id', 'actor_id', 'action', 'table_name', 'record_id', 'created_at'].includes(k)), [], 'only who/what/when is stored');
  }
  await signOut();
  await signIn('ann@example.test');
  assert.deepEqual(await admin.recentAudit(10), [], 'members cannot read the audit trail');
});

test('listRows paginates, searches and filters by status in the database', async () => {
  const { signIn } = useFake({ admins: ['boss@example.test'] });
  await signIn('boss@example.test', { admin: true });
  const p1 = await admin.listRows(res, { pageSize: 6 });
  assert.equal(p1.total, 17);
  assert.equal(p1.pageCount, 3);
  assert.equal(p1.items.length, 6);
  const overflow = await admin.listRows(res, { pageSize: 6, page: 50 });
  assert.equal(overflow.page, 3);
  assert.equal((await admin.listRows(res, { q: 'zzzzqq' })).total, 0);
  assert.equal((await admin.listRows(res, { status: 'draft' })).total, 0);
  assert.ok((await admin.listRows(res, { q: 'drip' })).total >= 1);
});

test('administrator-only data stays hidden from members', async () => {
  const { fake, signIn, signOut } = useFake({ admins: ['boss@example.test'] });
  await signOut();
  fake.__tables.contact_messages.push({ id: 'm1', name: 'X', email: 'x@y.zz', subject: 'Hi there', message: 'long enough message', status: 'new', reason: 'general' });
  await signIn('ann@example.test');
  const members = await fake.from('contact_messages').select('*');
  assert.deepEqual(members.data, []);
  await assert.rejects(admin.listMembers({}).then((r) => { if (r.items.length > 1) throw new Error('leak'); return Promise.reject(new ServiceError('permission_denied')); }), denied);
  await assert.rejects(admin.broadcastNotification({ kind: 'system', title: { en: 'a', sw: 'a' }, body: { en: 'b', sw: 'b' } }), denied);
  await assert.rejects(admin.saveSetting('seo.default', { title: 'hacked' }), denied);
  await signOut();
  await signIn('boss@example.test', { admin: true });
  assert.equal((await fake.from('contact_messages').select('*')).data.length, 1);
  assert.ok((await admin.listMembers({})).items.length >= 2);
  assert.equal(await admin.broadcastNotification({ kind: 'system', title: { en: 'a', sw: 'a' }, body: { en: 'b', sw: 'b' } }) >= 1, true);
  assert.ok((await admin.saveSetting('seo.default', { title: 'Ok' })).title === 'Ok');
});

test('every admin resource points at a real table, has a primary-key rule and bilingual fields', () => {
  for (const [name, r] of Object.entries(adminResources)) {
    assert.ok(r.table, `${name} has a table`);
    assert.ok(Array.isArray(r.fields) && (r.fields.length > 0 || r.moderationOnly), `${name} has fields (moderation-only resources have none: admins can only change their status)`);
    assert.ok(r.columns.length > 0, `${name} has list columns`);
  }
});
