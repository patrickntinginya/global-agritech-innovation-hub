import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// In-memory "recently viewed" list for the dashboard prototype. Not persisted anywhere.
const Ctx = createContext(null);

export function RecentlyViewedProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = (entry) =>
    setItems((prev) => [entry, ...prev.filter((p) => !(p.type === entry.type && p.id === entry.id))].slice(0, 8));
  const value = useMemo(() => ({ items, push }), [items]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRecentlyViewed() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useRecentlyViewed must be used inside <RecentlyViewedProvider>');
  return ctx.items;
}

export function useRecentlyViewedRecorder(entry) {
  const ctx = useContext(Ctx);
  const key = entry ? `${entry.type}:${entry.id}` : '';
  useEffect(() => {
    if (entry && ctx) ctx.push(entry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
