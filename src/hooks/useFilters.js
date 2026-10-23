import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

// Keeps filter state in the URL, so filtered views can be linked to and the back button works.
// `defaults` must be a stable object (declare it outside the component).
export default function useFilters(defaults) {
  const [params, setParams] = useSearchParams();

  const values = useMemo(
    () => Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, params.get(key) ?? fallback])),
    [params, defaults],
  );

  const setValues = useCallback(
    (patch) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === defaults[key] || value === '' || value == null) next.delete(key);
        else next.set(key, String(value));
      });
      if (!('page' in patch)) next.delete('page'); // any filter change returns to page 1
      setParams(next, { replace: true });
    },
    [params, defaults, setParams],
  );

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);
  const activeCount = useMemo(
    () => Object.keys(defaults).filter((k) => !['page', 'view', 'sort'].includes(k) && values[k] !== defaults[k]).length,
    [values, defaults],
  );

  return { values, setValues, reset, activeCount };
}
