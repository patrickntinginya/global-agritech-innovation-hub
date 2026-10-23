// Small form validator. Returns { field: { key, vars } } where key is an i18n key.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(values, rules) {
  const errors = {};
  for (const [field, list] of Object.entries(rules)) {
    const raw = values[field];
    const text = typeof raw === 'string' ? raw.trim() : '';
    for (const rule of list) {
      if (rule === 'required') {
        const empty = typeof raw === 'boolean' ? !raw : text === '';
        if (empty) {
          errors[field] = { key: typeof raw === 'boolean' ? 'validation.checked' : 'validation.required' };
          break;
        }
      } else if (rule === 'email') {
        if (text && !EMAIL.test(text)) { errors[field] = { key: 'validation.email' }; break; }
      } else if (rule && rule.min != null) {
        if (text && text.length < rule.min) { errors[field] = { key: 'validation.min', vars: { n: rule.min } }; break; }
      } else if (rule && rule.max != null) {
        if (text.length > rule.max) { errors[field] = { key: 'validation.max', vars: { n: rule.max } }; break; }
      } else if (rule && rule.match) {
        if (values[rule.match] !== raw) { errors[field] = { key: 'validation.match' }; break; }
      }
    }
  }
  return errors;
}
