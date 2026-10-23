import { useEffect, useState } from 'react';
import LoadingState from './LoadingState.jsx';
import { isBackendConfigured } from '../lib/config.js';
import { loadTaxonomies } from '../services/taxonomyService.js';

// Loads categories, countries, sectors and applications from the database before the pages render, because many
// components read those lists synchronously. If the load fails the bundled Phase 1 lists remain as a read-only
// fallback; the individual pages still show their own error states when their data cannot be loaded.
export default function TaxonomyGate({ children }) {
  const [ready, setReady] = useState(!isBackendConfigured());
  useEffect(() => {
    if (!isBackendConfigured()) return undefined;
    let active = true;
    loadTaxonomies()
      .catch((e) => console.warn('Taxonomies could not be loaded; using bundled lists.', e?.code ?? e?.name))
      .finally(() => active && setReady(true));
    return () => { active = false; };
  }, []);
  if (!ready) return <div className="container section"><LoadingState rows={2} /></div>;
  return children;
}
