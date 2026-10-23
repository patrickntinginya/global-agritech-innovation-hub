import { useCallback, useState } from 'react';
import { rules } from '../utils/rules.js';

// Small form helper. `rules` maps field name -> array of validator functions
// (value, allValues) => errorKey | null. Error keys are translated by the form, not here.
export { rules };

export default function useValidation(schema) {
  const [errors, setErrors] = useState({});

  const validateField = useCallback(
    (name, value, all) => {
      for (const rule of schema[name] ?? []) {
        const result = rule(value, all);
        if (result) return result;
      }
      return null;
    },
    [schema],
  );

  const validate = useCallback(
    (values) => {
      const next = {};
      Object.keys(schema).forEach((name) => {
        const err = validateField(name, values[name], values);
        if (err) next[name] = err;
      });
      setErrors(next);
      return Object.keys(next).length === 0;
    },
    [schema, validateField],
  );

  const clearError = useCallback((name) => setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e)), []);
  const reset = useCallback(() => setErrors({}), []);
  return { errors, validate, clearError, reset };
}
