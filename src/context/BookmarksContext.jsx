import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { addBookmark, listMyBookmarks, removeBookmark } from '../services/accountService.js';

// Saved innovations and articles are stored in the database (table bookmarks, scoped to the member by RLS).
// "Recently viewed" stays in memory on purpose: it is a convenience list, not account data.
const BookmarksContext = createContext(null);
const empty = () => ({ innovation: new Set(), article: new Set() });

export function BookmarksProvider({ children }) {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const [saved, setSaved] = useState(empty);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [viewed, setViewed] = useState([]);
  const pending = useRef(new Set());

  useEffect(() => {
    let active = true;
    setSaved(empty());
    setLoadError(null);
    if (status !== 'signedIn' || !userId) return undefined;
    listMyBookmarks(userId)
      .then((res) => active && setSaved({ innovation: new Set(res.innovations), article: new Set(res.articles) }))
      .catch((e) => active && setLoadError(e));
    return () => { active = false; };
  }, [status, userId]);

  // Optimistic update with rollback: the heart only stays filled if the database accepted the change.
  const toggleKind = useCallback(async (kind, slug) => {
    if (!userId) return { ok: false, needsSignIn: true };
    const key = `${kind}:${slug}`;
    if (pending.current.has(key)) return { ok: false };
    pending.current.add(key);
    setActionError(null);
    const was = saved[kind].has(slug);
    const flip = (on) => setSaved((prev) => {
      const next = new Set(prev[kind]);
      if (on) next.add(slug); else next.delete(slug);
      return { ...prev, [kind]: next };
    });
    flip(!was);
    try {
      if (was) await removeBookmark(userId, kind, slug); else await addBookmark(userId, kind, slug);
      return { ok: true };
    } catch (e) {
      flip(was);
      setActionError(e);
      return { ok: false, error: e };
    } finally {
      pending.current.delete(key);
    }
  }, [userId, saved]);

  const recordView = useCallback((kind, id) => {
    setViewed((prev) => [{ kind, id }, ...prev.filter((v) => !(v.kind === kind && v.id === id))].slice(0, 8));
  }, []);

  const value = useMemo(() => ({
    ids: saved.innovation, articleIds: saved.article, canSave: status === 'signedIn',
    has: (id) => saved.innovation.has(id), hasArticle: (id) => saved.article.has(id),
    toggle: (id) => toggleKind('innovation', id), toggleArticle: (id) => toggleKind('article', id),
    loadError, actionError, clearActionError: () => setActionError(null), viewed, recordView,
  }), [saved, status, toggleKind, loadError, actionError, viewed, recordView]);
  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used inside <BookmarksProvider>');
  return ctx;
}
