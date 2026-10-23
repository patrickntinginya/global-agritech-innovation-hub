import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Tabs from '../components/Tabs.jsx';
import DataLoader from '../components/DataLoader.jsx';
import DemoBadge from '../components/DemoBadge.jsx';
import Notice from '../components/Notice.jsx';
import MessageModal from '../components/MessageModal.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import { useI18n } from '../i18n/index.jsx';
import { listPartnerships } from '../services/contentService.js';
import { countryById } from '../data/countries.js';

export default function Partnerships() {
  const { t, loc } = useI18n();
  usePageTitle(t('partnerships.title'));
  const result = useAsync(listPartnerships, []);
  const [tab, setTab] = useState('opportunities');
  const [target, setTarget] = useState(null);

  const tabs = ['opportunities', 'challenges', 'organizations'].map((id) => ({ id, label: t(`partnerships.tabs.${id}`) }));

  return (
    <>
      <PageHeader
        title={t('partnerships.title')}
        description={t('partnerships.desc')}
        demo
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.startups'), to: '/startups' }, { label: t('partnerships.title') }]}
      >
        <Link to="/submit?type=opportunity" className="btn btn--primary">
          {t('partnerships.submit')}
        </Link>
      </PageHeader>
      <section className="section section--compact">
        <div className="container">
          <Notice kind="demo" title={t('partnerships.noticeTitle')}>
            {t('partnerships.notice')}
          </Notice>
          <Tabs tabs={tabs} value={tab} onChange={setTab} idPrefix="pt" label={t('partnerships.title')} />
          <DataLoader result={result}>
            {(data) => (
              <div role="tabpanel" id={`pt-panel-${tab}`} aria-labelledby={`pt-tab-${tab}`} className="tab-panel">
                {tab === 'opportunities' && (
                  <div className="grid grid--cards">
                    {data.opportunities.map((o) => (
                      <article key={o.id} className="card">
                        <div className="card__body">
                          <div className="expert-card__top">
                            <span className="badge-pill badge-pill--plain">{t(`partnerships.kind.${o.kind}`)}</span>
                            <DemoBadge compact />
                          </div>
                          <h3>{loc(o.title)}</h3>
                          <p>{loc(o.summary)}</p>
                          <p className="small muted">
                            {t(`partnerships.status.${o.status}`)}
                          </p>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTarget(loc(o.title))}>
                            {t('partnerships.interest')}
                            <span className="visually-hidden">: {loc(o.title)}</span>
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                {tab === 'challenges' && (
                  <div className="grid grid--cards">
                    {data.challenges.map((c) => (
                      <article key={c.id} className="card">
                        <div className="card__body">
                          <div className="expert-card__top">
                            <span className="badge-pill badge-pill--plain">{t('partnerships.challenge')}</span>
                            <DemoBadge compact />
                          </div>
                          <h3>{loc(c.title)}</h3>
                          <p>{loc(c.summary)}</p>
                          <p className="small muted">{t(`partnerships.status.${c.status}`)}</p>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTarget(loc(c.title))}>
                            {t('partnerships.propose')}
                            <span className="visually-hidden">: {loc(c.title)}</span>
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                {tab === 'organizations' && (
                  <div className="grid grid--cards">
                    {data.organizations.map((o) => (
                      <article key={o.id} className="card">
                        <div className="card__body">
                          <div className="expert-card__top">
                            <h3>{loc(o.name)}</h3>
                            <DemoBadge compact />
                          </div>
                          <p className="small muted">
                            {t(`partnerships.kind.${o.type}`)} · {loc(countryById[o.countryId].name)}
                          </p>
                          <p>{loc(o.summary)}</p>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTarget(loc(o.name))}>
                            {t('partnerships.contactOrg')}
                            <span className="visually-hidden">: {loc(o.name)}</span>
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </DataLoader>
        </div>
      </section>
      <MessageModal key={target ?? 'none'} open={Boolean(target)} onClose={() => setTarget(null)} title={target ?? ''} subtitle={t('partnerships.modalNote')} noteKey="partnerships.previewNote" />
    </>
  );
}
