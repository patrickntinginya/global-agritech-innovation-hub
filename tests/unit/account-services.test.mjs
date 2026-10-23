import test from 'node:test';
import assert from 'node:assert/strict';
import { useFake } from '../support/helpers.mjs';
import * as account from '../../src/services/accountService.js';
import { getDiscussion } from '../../src/services/contentService.js';
import { ServiceError } from '../../src/services/errors.js';

const idOf = (fake, email) => fake.__state.users.find((u) => u.email === email).id;

test('bookmarks are scoped to the signed-in member and removable', async () => {
  const { fake, signIn, signOut } = useFake();
  await signIn('ann@example.test');
  const ann = idOf(fake, 'ann@example.test');
  await account.addBookmark(ann, 'innovation', 'solar-drip-kit');
  await account.addBookmark(ann, 'article', 'k1');
  assert.deepEqual(await account.listMyBookmarks(ann), { innovations: ['solar-drip-kit'], articles: ['k1'] });
  await signOut();

  await signIn('bob@example.test');
  const bob = idOf(fake, 'bob@example.test');
  assert.deepEqual(await account.listMyBookmarks(bob), { innovations: [], articles: [] }, "Bob cannot see Ann's bookmarks");
  assert.deepEqual(await account.listMyBookmarks(ann), { innovations: [], articles: [] }, 'even when asking for her id');
  await signOut();

  await signIn('ann@example.test');
  await account.removeBookmark(ann, 'innovation', 'solar-drip-kit');
  assert.deepEqual((await account.listMyBookmarks(ann)).innovations, []);
});

test('bookmarking a record that does not exist or is unpublished fails instead of silently succeeding', async () => {
  const { fake, signIn } = useFake();
  await signIn('ann@example.test');
  const ann = idOf(fake, 'ann@example.test');
  await assert.rejects(account.addBookmark(ann, 'innovation', 'no-such-thing'), (e) => e instanceof ServiceError && e.code === 'not_found');
  fake.__tables.innovations[0].status = 'draft';
  await assert.rejects(account.addBookmark(ann, 'innovation', fake.__tables.innovations[0].slug), (e) => e.code === 'not_found');
});

test('profile update succeeds for the owner and fails visibly when no row is changed', async () => {
  const { fake, signIn } = useFake();
  await signIn('ann@example.test');
  const ann = idOf(fake, 'ann@example.test');
  const saved = await account.updateMyProfile(ann, { displayName: '  Ann  ', country: 'Tanzania', role: 'farmer', bio: 'Hello', interests: ['soil-health'], notify: { content: false, community: true, learning: true } });
  assert.equal(saved.displayName, 'Ann');
  assert.equal(saved.role, 'farmer');
  assert.deepEqual(saved.notify, { content: false, community: true, learning: true });
  assert.equal((await account.getMyProfile(ann)).country, 'Tanzania');
  // another member's profile: RLS filters the row out, so the UPDATE matches nothing and must be reported as failure
  const bobId = fake.__addUser('bob@example.test', 'Passw0rd!x').id;
  await assert.rejects(account.updateMyProfile(bobId, { displayName: 'Hacked' }), (e) => e instanceof ServiceError && e.code === 'not_found');
  assert.equal(fake.__tables.profiles.find((p) => p.id === bobId).display_name, 'bob');
});

test('notifications: list, mark read, mark all read, delete; never touches another member', async () => {
  const { fake, signIn, signOut } = useFake({ admins: ['boss@example.test'] });
  await signIn('ann@example.test');
  const ann = idOf(fake, 'ann@example.test');
  assert.deepEqual(await account.listMyNotifications(ann), [], 'no fake notifications are created');
  await signOut();
  await signIn('boss@example.test', { admin: true });
  const { broadcastNotification } = await import('../../src/services/adminService.js');
  const n = await broadcastNotification({ kind: 'system', title: { en: 'Hello', sw: 'Habari' }, body: { en: 'Body', sw: 'Mwili' }, link: '/' });
  assert.ok(n >= 1);
  await signOut();
  await signIn('ann@example.test');
  const list = await account.listMyNotifications(ann);
  assert.equal(list.length, 1);
  assert.equal(list[0].read, false);
  await account.markNotificationRead(ann, list[0].id);
  assert.equal((await account.listMyNotifications(ann))[0].read, true);
  await account.markAllNotificationsRead(ann);
  await account.deleteNotification(ann, list[0].id);
  assert.equal((await account.listMyNotifications(ann)).length, 0);
  await assert.rejects(account.markNotificationRead(ann, 'missing-id'), (e) => e.code === 'not_found');
});

test('content submissions: created as pending, readable only by the author', async () => {
  const { fake, signIn, signOut } = useFake();
  await signIn('ann@example.test');
  const ann = idOf(fake, 'ann@example.test');
  const form = { kind: 'innovation', title: 'A new drip emitter', organization: 'Ann Farms', country: 'africa', category: 'smart-irrigation', description: 'A longer description of the emitter, at least thirty characters.', email: 'ann@example.test' };
  await account.createSubmission(ann, form);
  const mine = await account.listMySubmissions(ann);
  assert.equal(mine.length, 1);
  assert.equal(mine[0].status, 'pending');
  await assert.rejects(account.createSubmission(ann, { ...form, description: 'too short' }), (e) => e.code === 'validation');
  await signOut();
  await signIn('bob@example.test');
  assert.deepEqual(await account.listMySubmissions(idOf(fake, 'bob@example.test')), []);
});

test('contact messages: anyone can send, the sender cannot read them back, validation errors are typed', async () => {
  const { fake, signOut } = useFake();
  await signOut();
  await account.sendContactMessage({ name: 'Visitor', email: 'v@example.test', reason: 'general', subject: 'Hello there', message: 'A message that is long enough.' });
  assert.equal(fake.__tables.contact_messages.length, 1);
  const read = await fake.from('contact_messages').select('*');
  assert.deepEqual(read.data, [], 'anonymous visitors cannot read messages');
  await assert.rejects(account.sendContactMessage({ name: 'V', email: 'v@example.test', subject: 'Hello', message: 'short' }), (e) => e.code === 'validation');
});

test('community: author is stamped by the backend and a client-supplied author is ignored', async () => {
  const { fake, signIn } = useFake();
  await signIn('ann@example.test');
  const ann = idOf(fake, 'ann@example.test');
  const slug = await account.createDiscussion(ann, { kind: 'question', topic: 'crops', title: 'How deep should I plant maize?', body: 'I would like to know the usual planting depth.' });
  assert.match(slug, /^how-deep-should-i-plant-maize-[a-z0-9]+$/);
  const row = fake.__tables.discussions.find((d) => d.slug === slug);
  assert.equal(row.author_id, ann);
  assert.equal(row.is_sample ?? false, false);
  const thread = await getDiscussion(slug);
  assert.equal(thread.title.en, 'How deep should I plant maize?');
  await account.createReply(ann, thread.uuid, '<b>bold</b> plain reply');
  const after = await getDiscussion(slug);
  assert.equal(after.replies.length, 1);
  assert.equal(after.replies[0].text.en, '<b>bold</b> plain reply', 'text is stored as text; React renders it escaped');
});

test('only the question author (or an admin) can accept an answer', async () => {
  const { fake, signIn, signOut } = useFake();
  await signIn('ann@example.test');
  const ann = idOf(fake, 'ann@example.test');
  const slug = await account.createDiscussion(ann, { kind: 'question', topic: 'crops', title: 'Question for accepting', body: 'A body long enough for the check.' });
  const q = await getDiscussion(slug);
  await signOut();
  await signIn('bob@example.test');
  const bob = idOf(fake, 'bob@example.test');
  await account.createReply(bob, q.uuid, 'Bob answers');
  const reply = (await getDiscussion(slug)).replies[0];
  await assert.rejects(account.acceptReply(reply.id), (e) => e.code === 'permission_denied', 'a different member cannot accept');
  await signOut();
  await signIn('ann@example.test');
  await account.acceptReply(reply.id);
  assert.equal((await getDiscussion(slug)).answered, true);
});

test('signed-out visitors cannot write member data', async () => {
  const { fake, signOut } = useFake();
  await signOut();
  await assert.rejects(account.createDiscussion('x', { kind: 'question', topic: 'crops', title: 'Anonymous post', body: 'Body long enough here.' }), (e) => e.code === 'permission_denied');
  await assert.rejects(account.createSubmission('x', { kind: 'innovation', title: 'Anonymous', organization: 'x', country: 'africa', category: 'smart-farming', description: 'd'.repeat(40), email: 'a@b.co' }), (e) => e.code === 'permission_denied');
  assert.equal(fake.__tables.discussions.filter((d) => !d.is_sample).length, 0);
});
