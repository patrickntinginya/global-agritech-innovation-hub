import PageHeader from '../components/PageHeader.jsx';
import Notice from '../components/Notice.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import { useI18n } from '../i18n/index.jsx';

// kind: 'privacy' | 'terms'. The text lives in the dictionaries (privacy.* and terms.*) so both languages stay in sync.
export default function LegalPage({ kind }) {
  const { t } = useI18n();
  const title = t(`${kind}.title`);
  usePageTitle(title);
  return (
    <>
      <PageHeader title={title} description={t(`legal.${kind}.intro`)} crumbs={[{ label: t('nav.home'), to: '/' }, { label: title }]} />
      <section className="section section--compact">
        <div className="container narrow prose">
          <Notice kind="demo" title={t('legal.draftLine')}>
            {t('legal.draftNotice')}
          </Notice>
          {t(`${kind}.sections`).map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              <p>{s.p}</p>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
