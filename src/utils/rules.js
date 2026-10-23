// Field validators shared by every form. Each returns null (valid) or an error key / { key, vars } that the form translates.
export const rules = {
  required: (v) => (String(v ?? '').trim() ? null : 'ui.errors.required'),
  email: (v) => (!String(v ?? '').trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim()) ? null : 'ui.errors.email'),
  min: (n) => (v) => (!String(v ?? '').trim() || String(v).trim().length >= n ? null : { key: 'ui.errors.min', vars: { n } }),
  match: (other) => (v, all) => (v === all[other] ? null : 'ui.errors.match'),
};
