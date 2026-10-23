// Flatten every string in a record (both languages) so search works whichever language is active.
export function haystack(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(haystack).join(' ');
  if (typeof value === 'object') return Object.values(value).map(haystack).join(' ');
  return '';
}

export const normalize = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// True when every word in the query appears somewhere in the record text.
export function matchesQuery(text, query) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const hay = normalize(text);
  return words.every((w) => hay.includes(w));
}

export function initials(name) {
  return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

export function paginate(items, page, pageSize) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), pageCount);
  const start = (current - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: current, pageCount, total: items.length, from: items.length ? start + 1 : 0, to: Math.min(start + pageSize, items.length) };
}
