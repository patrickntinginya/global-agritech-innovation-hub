import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Notice from '../components/Notice.jsx';
import Icon from '../components/Icon.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import { useI18n } from '../i18n/index.jsx';
import { communityRoles } from '../data/community.js';

export default function About() {
  const { t } = useI18n();
  usePageTitle(t('nav.about'));
  const pillars = ['discover', 'learn', 'connect'];
  const icons = { discover: 'globe', learn: 'book', connect: 'handshake' };
  return (
    <>
      <PageHeader title={t('nav.about')} description={t('about.lede')} crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.about') }]} />
      <section className="section section--compact">
        <div className="container narrow">
          <h2>{t('about.visionTitle')}</h2>
          <p>{t('about.vision')}</p>
          <h2>{t('about.focusTitle')}</h2>
          <p>{t('about.focus')}</p>
        </div>
      </section>
      <section className="section section--tint section--compact">
        <div className="container">
          <h2>{t('about.pillarsTitle')}</h2>
          <div className="grid grid--cards">
            {pillars.map((p) => (
              <article key={p} className="partner-card">
                <span className="partner-card__icon">
                  <Icon name={icons[p]} size={24} />
                </span>
                <h3>{t(`about.pillars.${p}.title`)}</h3>
                <p>{t(`about.pillars.${p}.body`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section section--compact">
        <div className="container narrow">
          <h2>{t('about.whoTitle')}</h2>
          <ul className="role-list">
            {communityRoles.map((r) => (
              <li key={r.id}>
                <Icon name={r.icon} size={20} />
                <span>{t(`community.roles.${r.id}`)}</span>
              </li>
            ))}
          </ul>
          <h2 className="mt">{t('about.statusTitle')}</h2>
          <Notice kind="demo" title={t('about.statusNoticeTitle')}>
            {t('about.status')}
          </Notice>
          <div className="btn-row">
            <Link to="/contact" className="btn btn--primary">
              {t('footer.contact')}
            </Link>
            <Link to="/explore" className="btn btn--ghost">
              {t('actions.explore')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
