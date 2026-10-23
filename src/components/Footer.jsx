import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import LanguageSelect from './LanguageSelect.jsx';
import { useI18n } from '../i18n/index.jsx';

const columns = [
  {
    headingKey: 'footer.explore',
    links: [
      ['footer.innovations', '/explore'],
      ['footer.agriculture', '/smart-farming'],
      ['footer.livestock', '/livestock'],
      ['footer.research', '/research'],
    ],
  },
  {
    headingKey: 'footer.platform',
    links: [
      ['footer.learning', '/courses'],
      ['footer.community', '/community'],
      ['footer.partnerships', '/partnerships'],
    ],
  },
  {
    headingKey: 'footer.company',
    links: [
      ['footer.about', '/about'],
      ['footer.contact', '/contact'],
      ['footer.privacy', '/privacy'],
      ['footer.terms', '/terms'],
    ],
  },
];

const socials = ['Facebook', 'X', 'LinkedIn', 'YouTube'];

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo />
          <p>{t('brand.tagline')}</p>
          <LanguageSelect tone="dark" />
          <div className="socials" role="group" aria-label={t('footer.social')}>
            {socials.map((name) => (
              <button key={name} type="button" className="social-btn" disabled title={t('footer.socialNote')}>
                {name}
              </button>
            ))}
          </div>
        </div>
        <nav className="site-footer__links" aria-label={t('a11y.footerNav')}>
          {columns.map((col) => (
            <div key={col.headingKey}>
              <h2 className="footer-heading">{t(col.headingKey)}</h2>
              <ul>
                {col.links.map(([labelKey, to]) => (
                  <li key={labelKey}>
                    <Link to={to}>{t(labelKey)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="container site-footer__legal">
        <p>{t('footer.rights', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
