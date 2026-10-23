import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';
import AccountActions from './AccountActions.jsx';
import LanguageSelect from './LanguageSelect.jsx';
import SearchModal from './SearchModal.jsx';
import { mainNav } from '../data/routes.js';
import { useI18n } from '../i18n/index.jsx';

export default function Navigation() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="site-header__bar container">
        <Logo />

        <nav
          id="primary-nav"
          className={`primary-nav ${menuOpen ? 'is-open' : ''}`}
          aria-label={t('a11y.mainNav')}
        >
          <ul>
            {mainNav.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === '/'}>
                  {t(item.key)}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="primary-nav__actions-mobile">
            <LanguageSelect tone="light" />
            <AccountActions />
          </div>
        </nav>

        <div className="site-header__tools">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setSearchOpen(true)}
            aria-label={t('actions.search')}
          >
            <Icon name="search" />
          </button>
          <div className="hide-below-wide">
            <LanguageSelect tone="light" />
          </div>
          <AccountActions className="hide-below-wide" />
          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            aria-label={menuOpen ? t('a11y.closeMenu') : t('a11y.openMenu')}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
