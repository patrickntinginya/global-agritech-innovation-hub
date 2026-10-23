import { createFakeSupabase } from './fakeSupabase.js';
import { setClientForTesting } from '../../src/lib/supabase.js';

// Installs a fresh in-memory backend as the app's Supabase client and returns small sign-in helpers.
// The fake mirrors the intent of the SQL policies; it does not prove the SQL (see tests/integration/README.md).
export function useFake(options = {}) {
  const fake = createFakeSupabase(options);
  setClientForTesting(fake);
  const signIn = async (email, { admin = false, password = 'Passw0rd!x' } = {}) => {
    if (!fake.__state.users.some((u) => u.email === email)) fake.__addUser(email, password, { admin });
    const res = await fake.auth.signInWithPassword({ email, password });
    if (res.error) throw new Error(`test sign-in failed: ${res.error.message}`);
    return res;
  };
  const signOut = () => fake.auth.signOut();
  return { fake, signIn, signOut };
}
