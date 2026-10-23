import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import LanguageSelect from '../../components/LanguageSelect.jsx';
import PrototypeNotice from '../../components/PrototypeNotice.jsx';
import ScrollToTop from '../../components/ScrollToTop.jsx';
import { adminSections } from './adminConfig.jsx';
import { useI18n } from '../../i18n/index.jsx';

// Separate shell for the admin interface. No access control exists in Phase 1: anyone can open it.
export default function AdminLayout() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-main">{t('a11y.skip')}</a>
      <ScrollToTop />
      <header className="admin-top">
        <button type="button" className="icon-btn admin-toggle" aria-expanded={open} aria-controls="admin-nav"
          aria-label={open ? t('a11y.closeMenu') : t('a11y.openMenu')} onClick={() => setOpen((v) => !v)}>
          <Icon name={open ? 'x' : 'menu'} />
        </button>
        <strong className="admin-top__title">{t('admin.title')}</strong>
        <span className="demo-badge">{t('admin.demoBadge')}</span>
        <div className="admin-top__tools">
          <LanguageSelect tone="light" />
          <Link to="/" className="btn btn--ghost btn--sm">{t('admin.backToSite')}</Link>
        </div>
      </header>
      <div className="admin-body">
        <nav id="admin-nav" className={`admin-nav ${open ? 'is-open' : ''}`} aria-label={t('admin.navLabel')}>
          <ul>
            {adminSections.map((s) => (
              <li key={s.key}>
                <NavLink to={s.to} end={s.end}>{t(`admin.sections.${s.key}.title`)}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main id="admin-main" className="admin-main" tabIndex={-1}>
          <PrototypeNotice kind="admin" />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
