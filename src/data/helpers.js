// Tiny helpers for bilingual demonstration records.
export const bi = (en, sw) => ({ en, sw });
export const bia = (en, sw) => ({ en, sw });

// Flatten every language of a bilingual field into one lowercase string, for search.
export function searchable(...parts) {
  const out = [];
  const visit = (v) => {
    if (v == null) return;
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(visit);
    else if (typeof v === 'object') Object.values(v).forEach(visit);
  };
  parts.forEach(visit);
  return out.join(' ').toLowerCase();
}
