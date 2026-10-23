// One error type for every backend failure, so the UI can show a translated, honest message.
// code: not_configured | permission_denied | session_expired | not_found | conflict | validation | network | unknown
export class ServiceError extends Error {
  constructor(code, detail = '') {
    super(`${code}${detail ? `: ${detail}` : ''}`);
    this.name = 'ServiceError';
    this.code = code;
    this.detail = detail;
  }
}

// Maps a PostgREST / Postgres / fetch error to a ServiceError. The raw error message is kept only in `detail`
// for developers and is never shown to visitors.
export function toServiceError(error) {
  if (!error) return new ServiceError('unknown');
  if (error instanceof ServiceError) return error;
  const code = String(error.code ?? '');
  const msg = String(error.message ?? '');
  if (code === '42501' || /row-level security|permission denied/i.test(msg)) return new ServiceError('permission_denied', msg);
  if (code === 'PGRST301' || code === 'PGRST303' || /jwt (expired|invalid)/i.test(msg)) return new ServiceError('session_expired', msg);
  if (code === 'PGRST116' || code === 'P0002') return new ServiceError('not_found', msg);
  if (code === '23505') return new ServiceError('conflict', msg);
  if (code === '23503') return new ServiceError('conflict', msg);
  if (code === '23514' || code === '23502' || code === '22P02' || code === '22001') return new ServiceError('validation', msg);
  if (error.name === 'TypeError' || /failed to fetch|networkerror|load failed/i.test(msg)) return new ServiceError('network', msg);
  return new ServiceError('unknown', msg);
}

// Awaits a Supabase query builder and throws a ServiceError on failure. Returns { data, count }.
export async function exec(query) {
  let res;
  try {
    res = await query;
  } catch (e) {
    throw toServiceError(e);
  }
  if (res.error) throw toServiceError(res.error);
  return { data: res.data, count: res.count ?? null };
}

// Escapes % _ and \ so user text is matched literally inside ILIKE patterns.
export const likePattern = (text) => `%${String(text).trim().toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
