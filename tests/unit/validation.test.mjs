import test from 'node:test';
import assert from 'node:assert/strict';
import { rules } from '../../src/utils/rules.js';
import { cleanText, makeSlug } from '../../src/services/accountService.js';
import { likePattern } from '../../src/services/errors.js';

test('required / email / min / match rules', () => {
  assert.equal(rules.required(''), 'ui.errors.required');
  assert.equal(rules.required('   '), 'ui.errors.required');
  assert.equal(rules.required('x'), null);
  assert.equal(rules.email('a@b.co'), null);
  assert.equal(rules.email('not-an-email'), 'ui.errors.email');
  assert.equal(rules.email(''), null); // emptiness is the job of `required`
  assert.deepEqual(rules.min(8)('short'), { key: 'ui.errors.min', vars: { n: 8 } });
  assert.equal(rules.min(8)('long enough'), null);
  assert.equal(rules.match('password')('a', { password: 'a' }), null);
  assert.equal(rules.match('password')('a', { password: 'b' }), 'ui.errors.match');
});

test('cleanText strips control and zero-width characters and trims', () => {
  assert.equal(cleanText('  hi\u0000 there\u200B  '), 'hi there');
  assert.equal(cleanText(null), '');
  assert.equal(cleanText('<b>bold</b>'), '<b>bold</b>'); // kept as text: React renders it escaped, never as HTML
});

test('makeSlug produces a valid, bounded slug', () => {
  const slug = makeSlug('Which Sensors are Worth Buying First?!', () => 'abc123');
  assert.equal(slug, 'which-sensors-are-worth-buying-first-abc123');
  assert.match(makeSlug('???', () => 'x1'), /^post-x1$/);
  assert.match(makeSlug('x'.repeat(200), () => 'zz'), /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.ok(makeSlug('x'.repeat(200), () => 'zz').length <= 50);
});

test('likePattern escapes wildcards so user input matches literally', () => {
  assert.equal(likePattern('50%_off'), '%50\\%\\_off%');
  assert.equal(likePattern('  Drip '), '%drip%');
  assert.equal(likePattern('a\\b'), '%a\\\\b%');
});
