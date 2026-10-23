import { useParams } from 'react-router-dom';
import AdminTable from './AdminTable.jsx';
import AdminUsers from './AdminUsers.jsx';
import AdminMedia from './AdminMedia.jsx';
import AdminNotifications from './AdminNotifications.jsx';
import AdminSettings from './AdminSettings.jsx';
import NotFound from '../NotFound.jsx';
import { adminResources } from './adminResources.js';

const special = {
  users: <AdminUsers />,
  media: <AdminMedia />,
  notifications: <AdminNotifications />,
  seo: <AdminSettings kind="seo" />,
  settings: <AdminSettings kind="platform" />,
};

// Picks the screen for /admin/:section. Table sections are generated from adminResources; unknown sections show the 404 page.
export default function AdminSection() {
  const { section } = useParams();
  if (Object.hasOwn(special, section)) return special[section];
  if (!Object.hasOwn(adminResources, section)) return <NotFound />;
  return <AdminTable key={section} resourceKey={section} resource={adminResources[section]} />;
}
