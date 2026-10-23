import { Outlet } from 'react-router-dom';
import Navigation from './Navigation.jsx';
import Footer from './Footer.jsx';
import ScrollToTop from './ScrollToTop.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function Layout() {
  const { t } = useI18n();
  return (
    <>
      <a className="skip-link" href="#main">
        {t('a11y.skip')}
      </a>
      <ScrollToTop />
      <Navigation />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
