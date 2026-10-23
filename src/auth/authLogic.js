// Pure helpers for authentication: no React, no network. Covered by unit tests.

// Maps a Supabase Auth error to a translation key. Raw error messages are never shown to people.
export function authErrorKey(error) {
  if (!error) return 'auth.errors.unknown';
  const code = String(error.code ?? '').toLowerCase();
  const msg = String(error.message ?? '').toLowerCase();
  if (code === 'invalid_credentials' || /invalid login credentials/.test(msg)) return 'auth.errors.invalidCredentials';
  if (code === 'email_not_confirmed' || /email not confirmed/.test(msg)) return 'auth.errors.emailNotConfirmed';
  if (code === 'user_already_exists' || code === 'email_exists' || /already (been )?registered|already exists/.test(msg)) return 'auth.errors.duplicate';
  if (code === 'weak_password' || /password should be|weak password/.test(msg)) return 'auth.errors.weakPassword';
  if (code === 'same_password' || /different from the old/.test(msg)) return 'auth.errors.samePassword';
  if (error.status === 429 || code.includes('rate_limit') || /rate limit|too many requests|security purposes/.test(msg)) return 'auth.errors.rateLimited';
  if (code === 'session_not_found' || code === 'refresh_token_not_found' || /jwt expired|auth session missing|session.*(expired|not found)/.test(msg)) return 'auth.errors.sessionExpired';
  if (code === 'signup_disabled') return 'auth.errors.signupDisabled';
  if (error.name === 'TypeError' || /failed to fetch|networkerror|load failed/.test(msg)) return 'auth.errors.network';
  return 'auth.errors.unknown';
}

const AUTH_PATHS = ['/signin', '/register', '/forgot-password', '/reset-password'];

// Accepts only a same-site path, so a crafted ?next= value can neither redirect off-site nor bounce between auth pages.
export function safeNext(next, fallback = '/dashboard') {
  if (typeof next !== 'string' || next.length === 0 || next.length > 300) return fallback;
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\') || /[\u0000-\u001f]/.test(next)) return fallback;
  const path = next.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return AUTH_PATHS.includes(path) ? fallback : next;
}

// status: 'loading' | 'unconfigured' | 'signedOut' | 'signedIn'.
// Returns what a protected route should do: 'loading' | 'unconfigured' | 'signin' | 'forbidden' | 'allow'.
// Admin access additionally needs isAdmin, which comes from the database function is_admin(); the UI check only
// decides what to show: the database policies are what actually protect the data.
export function decideAccess({ status, isAdmin = false, requireAdmin = false }) {
  if (status === 'loading') return 'loading';
  if (status === 'unconfigured') return 'unconfigured';
  if (status !== 'signedIn') return 'signin';
  if (requireAdmin && !isAdmin) return 'forbidden';
  return 'allow';
}
