import test from 'node:test';
import assert from 'node:assert/strict';
import { authErrorKey, safeNext, decideAccess } from '../../src/auth/authLogic.js';

test('authErrorKey maps Supabase Auth errors to translation keys', () => {
  const cases = [
    [{ code: 'invalid_credentials', message: 'Invalid login credentials' }, 'auth.errors.invalidCredentials'],
    [{ message: 'Email not confirmed' }, 'auth.errors.emailNotConfirmed'],
    [{ code: 'user_already_exists' }, 'auth.errors.duplicate'],
    [{ message: 'User already registered' }, 'auth.errors.duplicate'],
    [{ code: 'weak_password' }, 'auth.errors.weakPassword'],
    [{ code: 'same_password' }, 'auth.errors.samePassword'],
    [{ status: 429, message: 'x' }, 'auth.errors.rateLimited'],
    [{ code: 'over_email_send_rate_limit' }, 'auth.errors.rateLimited'],
    [{ message: 'Auth session missing!' }, 'auth.errors.sessionExpired'],
    [{ name: 'TypeError', message: 'Failed to fetch' }, 'auth.errors.network'],
    [{ code: 'signup_disabled' }, 'auth.errors.signupDisabled'],
    [{ message: 'something odd' }, 'auth.errors.unknown'],
    [null, 'auth.errors.unknown'],
  ];
  for (const [input, expected] of cases) assert.equal(authErrorKey(input), expected, JSON.stringify(input));
});

test('authErrorKey never returns the raw error message', () => {
  assert.equal(authErrorKey({ message: 'secret internal detail xyz' }).includes('secret'), false);
});

test('safeNext only allows same-site paths and cannot loop through auth pages', () => {
  assert.equal(safeNext('/saved'), '/saved');
  assert.equal(safeNext('/explore?page=2&q=drip'), '/explore?page=2&q=drip');
  for (const bad of ['https://evil.example', '//evil.example', '/\\evil', 'javascript:alert(1)', '', null, undefined, 42, `/${'a'.repeat(400)}`]) {
    assert.equal(safeNext(bad), '/dashboard', String(bad));
  }
  for (const loop of ['/signin', '/signin?next=/saved', '/register', '/forgot-password', '/reset-password/', '/signin#x']) {
    assert.equal(safeNext(loop), '/dashboard', loop);
  }
  assert.equal(safeNext('/signin', '/'), '/');
});

test('decideAccess: protected route outcomes', () => {
  assert.equal(decideAccess({ status: 'loading' }), 'loading');
  assert.equal(decideAccess({ status: 'unconfigured' }), 'unconfigured');
  assert.equal(decideAccess({ status: 'signedOut' }), 'signin');
  assert.equal(decideAccess({ status: 'signedIn' }), 'allow');
  assert.equal(decideAccess({ status: 'signedIn', isAdmin: false, requireAdmin: true }), 'forbidden');
  assert.equal(decideAccess({ status: 'signedIn', isAdmin: true, requireAdmin: true }), 'allow');
  assert.equal(decideAccess({ status: 'signedOut', isAdmin: true, requireAdmin: true }), 'signin');
});
