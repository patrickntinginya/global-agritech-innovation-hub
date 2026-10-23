import test from 'node:test';
import assert from 'node:assert/strict';
import { ServiceError, toServiceError, exec, likePattern } from '../../src/services/errors.js';

test('toServiceError classifies database and network failures', () => {
  const code = (e) => toServiceError(e).code;
  assert.equal(code({ code: '42501', message: 'x' }), 'permission_denied');
  assert.equal(code({ message: 'new row violates row-level security policy for table "x"' }), 'permission_denied');
  assert.equal(code({ code: 'PGRST301', message: 'x' }), 'session_expired');
  assert.equal(code({ message: 'JWT expired' }), 'session_expired');
  assert.equal(code({ code: 'PGRST116' }), 'not_found');
  assert.equal(code({ code: '23505' }), 'conflict');
  assert.equal(code({ code: '23503' }), 'conflict');
  assert.equal(code({ code: '23514' }), 'validation');
  assert.equal(code(new TypeError('Failed to fetch')), 'network');
  assert.equal(code({ code: 'XX000', message: 'boom' }), 'unknown');
  assert.equal(code(new ServiceError('not_configured')), 'not_configured');
});

test('exec turns { error } results and thrown errors into ServiceError', async () => {
  await assert.rejects(exec(Promise.resolve({ data: null, error: { code: '42501', message: 'no' } })), (e) => e instanceof ServiceError && e.code === 'permission_denied');
  await assert.rejects(exec(Promise.reject(new TypeError('Failed to fetch'))), (e) => e.code === 'network');
  assert.deepEqual(await exec(Promise.resolve({ data: [1], error: null, count: 4 })), { data: [1], count: 4 });
});

test('likePattern escapes wildcards so user text is matched literally', () => {
  assert.equal(likePattern('Drip'), '%drip%');
  assert.equal(likePattern('100%_x\\y'), '%100\\%\\_x\\\\y%');
});
