// TEST-ONLY stand-in for react-router-dom v6, used ONLY when the real package cannot be installed (USE_ROUTER_SHIM=1).
// Implements only the subset the app uses: BrowserRouter, Routes/Route (nested, index, :params, *, ranking),
// Outlet, Link, NavLink, useNavigate, useParams, useLocation, useSearchParams.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const RouterCtx = createContext(null);
const OutletCtx = createContext(null);
const ParamsCtx = createContext({});

const parse = (to) => { const u = new URL(to, window.location.origin); return { pathname: u.pathname, search: u.search, hash: u.hash }; };

export function BrowserRouter({ children }) {
  const [loc, setLoc] = useState(parse(window.location.href));
  useEffect(() => {
    const on = () => setLoc(parse(window.location.href));
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);
  const navigate = useCallback((to, opts = {}) => {
    if (typeof to === 'number') { window.history.go(to); return; }
    window.history[opts.replace ? 'replaceState' : 'pushState'](null, '', to);
    setLoc(parse(window.location.href));
  }, []);
  const value = useMemo(() => ({ loc, navigate }), [loc, navigate]);
  return <RouterCtx.Provider value={value}>{children}</RouterCtx.Provider>;
}

export const useNavigate = () => useContext(RouterCtx).navigate;
export const useLocation = () => useContext(RouterCtx).loc;
export const useParams = () => useContext(ParamsCtx);
export function useSearchParams() {
  const { loc, navigate } = useContext(RouterCtx);
  const params = useMemo(() => new URLSearchParams(loc.search), [loc.search]);
  const set = useCallback((next, opts) => {
    const n = typeof next === 'function' ? next(params) : next;
    const sp = n instanceof URLSearchParams ? n : new URLSearchParams(n);
    const s = sp.toString();
    navigate(`${loc.pathname}${s ? `?${s}` : ''}`, opts);
  }, [params, loc.pathname, navigate]);
  return [params, set];
}

export function Navigate({ to, replace }) {
  const { navigate } = useContext(RouterCtx);
  useEffect(() => { navigate(to, { replace }); }, [to, replace, navigate]);
  return null;
}
export function Route() { return null; }
export function Outlet() { return useContext(OutletCtx); }

const segsOf = (p) => (p ?? '').split('/').filter(Boolean);
function toRoutes(children) {
  return React.Children.toArray(children).filter((c) => c && c.type === Route).map((c) => ({
    path: c.props.path, index: !!c.props.index, element: c.props.element, children: toRoutes(c.props.children),
  }));
}
function flatten(routes, chain = [], segs = [], out = []) {
  for (const r of routes) {
    const c = [...chain, r];
    const s = [...segs, ...segsOf(r.path)];
    if (r.children.length) flatten(r.children, c, s, out);
    if (r.index || (r.path !== undefined && !r.children.length)) out.push({ chain: c, segs: s, index: r.index });
    else if (r.path !== undefined) out.push({ chain: c, segs: s, index: false, selfOnly: true });
  }
  return out;
}
function score(b) {
  return b.segs.reduce((n, s) => n + (s === '*' ? -2 : s.startsWith(':') ? 3 : 10), 0) + (b.index ? 2 : 0) + b.segs.length;
}
function matchBranch(b, pathSegs) {
  const params = {};
  for (let i = 0; i < b.segs.length; i++) {
    const s = b.segs[i];
    if (s === '*') { params['*'] = pathSegs.slice(i).join('/'); return params; }
    if (pathSegs[i] === undefined) return null;
    if (s.startsWith(':')) params[s.slice(1)] = decodeURIComponent(pathSegs[i]);
    else if (s !== pathSegs[i]) return null;
  }
  return pathSegs.length === b.segs.length ? params : null;
}

export function Routes({ children }) {
  const { loc } = useContext(RouterCtx);
  const branches = useMemo(() => flatten(toRoutes(children)), [children]);
  const pathSegs = segsOf(loc.pathname);
  let best = null;
  for (const b of branches) {
    const params = matchBranch(b, pathSegs);
    if (params && (!best || score(b) > score(best.b))) best = { b, params };
  }
  if (!best) return null;
  let el = null;
  for (let i = best.b.chain.length - 1; i >= 0; i--) {
    const r = best.b.chain[i];
    const inner = el;
    el = <OutletCtx.Provider value={inner}>{r.element ?? <Outlet />}</OutletCtx.Provider>;
  }
  return <ParamsCtx.Provider value={best.params}>{el}</ParamsCtx.Provider>;
}

export function Link({ to, replace, onClick, children, ...rest }) {
  const { navigate } = useContext(RouterCtx);
  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') return;
        e.preventDefault();
        navigate(to, { replace });
      }}
    >
      {children}
    </a>
  );
}

export function NavLink({ to, end, className, children, ...rest }) {
  const { loc } = useContext(RouterCtx);
  const path = to.split('?')[0];
  const active = end || path === '/' ? loc.pathname === path : loc.pathname === path || loc.pathname.startsWith(`${path}/`);
  const cls = typeof className === 'function' ? className({ isActive: active }) : [className, active ? 'active' : ''].filter(Boolean).join(' ');
  return <Link to={to} className={cls} aria-current={active ? 'page' : undefined} {...rest}>{children}</Link>;
}

