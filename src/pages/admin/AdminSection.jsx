import { useParams } from 'react-router-dom';
import AdminResource from './AdminResource.jsx';
import NotFound from '../NotFound.jsx';
import { adminResources } from './adminConfig.jsx';

// Picks the table configuration for /admin/:section. Unknown sections show the 404 page.
export default function AdminSection() {
  const { section } = useParams();
  const config = Object.hasOwn(adminResources, section) ? adminResources[section] : null;
  if (!config) return <NotFound />;
  return <AdminResource key={config.key} config={config} />;
}
