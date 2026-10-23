import { createClient } from '@supabase/supabase-js';
import { config, isBackendConfigured } from './config.js';
import { ServiceError } from '../services/errors.js';

let client = null;

// Lazily created so an unconfigured build still loads and can show a clear "not configured" state.
export function getClient() {
  if (client) return client;
  if (!isBackendConfigured()) throw new ServiceError('not_configured');
  client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

// Test hook: lets unit tests and browser checks supply a stand-in client. Not used in production code paths.
export function setClientForTesting(next) {
  client = next;
}
