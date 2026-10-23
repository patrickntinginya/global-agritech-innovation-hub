import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getClient } from '../lib/supabase.js';
import { appUrl, isBackendConfigured } from '../lib/config.js';
import { authErrorKey } from './authLogic.js';

// Authentication state for the whole app. Passwords go straight to Supabase Auth and are never kept in state,
// storage or logs by this code. The session itself is persisted by the Supabase client.
const AuthContext = createContext(null);

const initial = () => ({ status: isBackendConfigured() ? 'loading' : 'unconfigured', user: null, isAdmin: false, expired: false });

export function AuthProvider({ children }) {
  const [state, setState] = useState(initial);
  const hadUser = useRef(false);
  const explicitSignOut = useRef(false);

  useEffect(() => {
    if (!isBackendConfigured()) return undefined;
    const db = getClient();
    let active = true;

    const apply = async (session) => {
      if (!session?.user) {
        // Signing out on purpose is not an expiry. A session that vanishes by itself is.
        const expired = hadUser.current && !explicitSignOut.current;
        hadUser.current = false;
        explicitSignOut.current = false;
        if (active) setState({ status: 'signedOut', user: null, isAdmin: false, expired });
        return;
      }
      hadUser.current = true;
      let isAdmin = false;
      try {
        const { data, error } = await db.rpc('is_admin');
        isAdmin = !error && data === true;
      } catch {
        isAdmin = false;
      }
      if (active) setState({ status: 'signedIn', user: { id: session.user.id, email: session.user.email }, isAdmin, expired: false });
    };

    db.auth.getSession().then(({ data }) => apply(data.session)).catch(() => active && setState({ status: 'signedOut', user: null, isAdmin: false, expired: false }));
    // Deferred: calling Supabase from inside this callback can deadlock the client.
    const { data: sub } = db.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => apply(session), 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async ({ email, password, displayName, accountType, country, language }) => {
    try {
      const { data, error } = await getClient().auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${appUrl()}/signin`,
          data: { display_name: displayName.trim(), account_type: accountType || null, country: country?.trim() || null, language },
        },
      });
      if (error) return { ok: false, errorKey: authErrorKey(error) };
      // With email confirmation on, Supabase answers a duplicate sign-up with a user that has no identities.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) return { ok: false, errorKey: 'auth.errors.duplicate' };
      return { ok: true, needsConfirmation: !data.session };
    } catch (e) {
      return { ok: false, errorKey: authErrorKey(e) };
    }
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    try {
      const { error } = await getClient().auth.signInWithPassword({ email: email.trim(), password });
      return error ? { ok: false, errorKey: authErrorKey(error) } : { ok: true };
    } catch (e) {
      return { ok: false, errorKey: authErrorKey(e) };
    }
  }, []);

  const signOut = useCallback(async () => {
    explicitSignOut.current = true;
    try {
      const { error } = await getClient().auth.signOut();
      if (error) {
        explicitSignOut.current = false;
        return { ok: false, errorKey: authErrorKey(error) };
      }
      return { ok: true };
    } catch (e) {
      explicitSignOut.current = false;
      return { ok: false, errorKey: authErrorKey(e) };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    try {
      const { error } = await getClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${appUrl()}/reset-password` });
      return error ? { ok: false, errorKey: authErrorKey(error) } : { ok: true };
    } catch (e) {
      return { ok: false, errorKey: authErrorKey(e) };
    }
  }, []);

  const updatePassword = useCallback(async (password) => {
    try {
      const { error } = await getClient().auth.updateUser({ password });
      return error ? { ok: false, errorKey: authErrorKey(error) } : { ok: true };
    } catch (e) {
      return { ok: false, errorKey: authErrorKey(e) };
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, signUp, signIn, signOut, requestPasswordReset, updatePassword }),
    [state, signUp, signIn, signOut, requestPasswordReset, updatePassword],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
