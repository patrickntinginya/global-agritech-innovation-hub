// Runtime configuration. Only PUBLIC values belong here: the Supabase URL and the anon (publishable) key.
// Never put a service-role key or any other secret in a VITE_ variable: Vite embeds these in the browser bundle.
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const config = {
  supabaseUrl: (env.VITE_SUPABASE_URL ?? '').trim(),
  supabaseAnonKey: (env.VITE_SUPABASE_ANON_KEY ?? '').trim(),
  // Optional. Used for auth email redirects. Defaults to the origin the app is running on.
  appUrl: (env.VITE_APP_URL ?? '').trim().replace(/\/+$/, ''),
};

export const isBackendConfigured = () => Boolean(config.supabaseUrl && config.supabaseAnonKey);

export function appUrl() {
  if (config.appUrl) return config.appUrl;
  return typeof window !== 'undefined' ? window.location.origin : '';
}
