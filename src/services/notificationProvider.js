// Delivery boundary for notifications. Phase 2 delivers in-app only: rows in public.notifications that the member
// sees on the Notifications page. Email or push delivery needs an external provider (for example Resend, or Supabase
// Edge Functions with database webhooks) running in a TRUSTED environment with its own secret key. To add one,
// implement `deliver(notification, recipient)` below and register it; nothing here ships a provider or a secret.
const providers = [];

export const inAppProvider = { name: 'in-app', deliver: async () => ({ ok: true }) };

export function registerProvider(provider) {
  if (typeof provider?.deliver !== 'function') throw new TypeError('provider.deliver must be a function');
  providers.push(provider);
}

export const activeProviders = () => [inAppProvider, ...providers];
