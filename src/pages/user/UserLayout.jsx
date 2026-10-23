import { NavLink, Outlet } from 'react-router-dom';
import Notice from '../../components/Notice.jsx';
import Icon from '../../components/Icon.jsx';
import { useI18n } from '../../i18n/index.jsx';

const links = [
  { to: '/dashboard', key: 'user.nav.dashboard', icon: 'layers' },
  { to: '/profile', key: 'user.nav.profile', icon: 'users' },
  { to: '/saved', key: 'user.nav.saved', icon: 'bookmark' },
  { to: '/notifications', key: 'user.nav.notifications', icon: 'mail' },
  { to: '/settings', key: 'user.nav.settings', icon: 'shield' },
];

export default function UserLayout() {
  const { t } = useI18n();
  return (
    <div className="container user-shell">
      <nav className="side-nav" aria-label={t('user.navLabel')}>
        <ul>
          {links.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to}>
                <Icon name={l.icon} size={18} />
                {t(l.key)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="user-shell__content">
        <Outlet />
      </div>
    </div>
  );
}
