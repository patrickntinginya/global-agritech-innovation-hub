import { useCallback, useEffect, useRef, useState } from 'react';

// Runs an async loader and exposes { data, loading, error, status, reload, retry }.
// `status` is 'loading' | 'error' | 'success'. The loader re-runs whenever a value in `deps` changes.
export default function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let active = true;
    setState((s) => ({ data: s.data, loading: true, error: null }));
    Promise.resolve()
      .then(() => loaderRef.current())
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  const status = state.error ? 'error' : state.loading && state.data == null ? 'loading' : 'success';
  return { ...state, status, reload, retry: reload };
}
