import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Phase 1: bookmarks and "recently viewed" live in component state only. They vanish on reload by
// design, because nothing is saved to an account or a database yet.
const BookmarksContext = createContext(null);

export function BookmarksProvider({ children }) {
  const [ids, setIds] = useState(() => new Set());
  const [viewed, setViewed] = useState([]);

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // kind: 'innovation' | 'article' | 'course'
  const recordView = useCallback((kind, id) => {
    setViewed((prev) => [{ kind, id }, ...prev.filter((v) => !(v.kind === kind && v.id === id))].slice(0, 8));
  }, []);

  const value = useMemo(() => ({ ids, toggle, has: (id) => ids.has(id), viewed, recordView }), [ids, toggle, viewed, recordView]);
  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used inside <BookmarksProvider>');
  return ctx;
}
