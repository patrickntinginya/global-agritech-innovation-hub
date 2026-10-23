// Collects the text of a field in every language so searches work in English and Kiswahili.
function flatten(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(flatten).join(' ');
  return Object.values(value).map(flatten).join(' ');
}

export function matches(query, ...fields) {
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return true;
  const haystack = fields.map(flatten).join(' ').toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

export const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
