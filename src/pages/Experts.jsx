import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import SearchField from '../components/SearchField.jsx';
import { FilterSelect, TextField } from '../components/forms.jsx';
import DataLoader from '../components/DataLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import DemoBadge from '../components/DemoBadge.jsx';
import Modal from '../components/Modal.jsx';
import Notice from '../components/Notice.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import useFilters from '../hooks/useFilters.js';
import useValidation, { rules } from '../hooks/useValidation.js';
import { useI18n } from '../i18n/index.jsx';
import { queryExperts } from '../services/contentService.js';
import { expertAreas } from '../data/experts.js';
import { countryById } from '../data/countries.js';

const defaults = { q: '', area: 'all' };
const schema = { name: [rules.required], email: [rules.required, rules.email], message: [rules.required, rules.min(10)] };

function ConnectModal({ expert, onClose }) {
  const { t, loc } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [checked, setChecked] = useState(false);
  const { errors, validate, clearError } = useValidation(schema);
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    clearError(k);
  };
  const submit = (e) => {
    e.preventDefault();
    setChecked(validate(form));
  };
  return (
    <Modal open={Boolean(expert)} onClose={onClose} title={expert ? t('experts.connectTitle', { name: expert.name }) : ''} titleId="connect-title">
      {expert && (
        <form onSubmit={submit} noValidate>
          <p className="small muted">{loc(expert.title)}</p>
          <TextField label={t('forms.name')} value={form.name} onValue={set('name')} error={errors.name} required autoComplete="name" />
          <TextField label={t('forms.email')} type="email" value={form.email} onValue={set('email')} error={errors.email} required autoComplete="email" />
          <TextField label={t('forms.message')} as="textarea" value={form.message} onValue={set('message')} error={errors.message} required />
          {checked && (
            <Notice kind="backend" title={t('ui.previewTitle')}>
              {t('experts.previewNote')}
            </Notice>
          )}
          <div className="btn-row">
            <button type="submit" className="btn btn--primary">
              {t('experts.checkMessage')}
            </button>
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              {t('actions.close')}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default function Experts() {
  const { t, loc } = useI18n();
  usePageTitle(t('experts.title'));
  const { values, setValues, reset, activeCount } = useFilters(defaults);
  const result = useAsync(() => queryExperts(values), [values.q, values.area]);
  const [active, setActive] = useState(null);

  return (
    <>
      <PageHeader title={t('experts.title')} description={t('experts.desc')} demo crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('experts.title') }]} />
      <section className="section section--compact">
        <div className="container">
          <Notice kind="demo" title={t('experts.noticeTitle')}>
            {t('experts.notice')}
          </Notice>
          <div className="filters">
            <div className="filters__top">
              <SearchField label={t('experts.searchLabel')} value={values.q} onChange={(q) => setValues({ q })} placeholder={t('experts.searchPlaceholder')} />
            </div>
            <div className="filters__panel is-open filters__panel--always">
              <FilterSelect
                label={t('experts.area')}
                value={values.area}
                onChange={(area) => setValues({ area })}
                options={[{ value: 'all', label: t('ui.all') }, ...expertAreas.map((a) => ({ value: a, label: t(`experts.areas.${a}`) }))]}
              />
            </div>
          </div>
          <div className="results-bar">
            <p className="results-bar__count" aria-live="polite">
              {result.data ? t('ui.results', { n: result.data.length }) : t('loading')}
            </p>
            {activeCount > 0 && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
                {t('ui.clearFilters')}
              </button>
            )}
          </div>
          <DataLoader result={result}>
            {(list) =>
              list.length === 0 ? (
                <EmptyState title={t('experts.emptyTitle')} body={t('experts.emptyBody')} />
              ) : (
                <div className="grid grid--cards">
                  {list.map((e) => (
                    <article key={e.id} className="card expert-card">
                      <div className="card__body">
                        <div className="expert-card__top">
                          <span className="avatar" aria-hidden="true">
                            {e.name.split(' ').pop()}
                          </span>
                          <DemoBadge compact />
                        </div>
                        <h3>{e.name}</h3>
                        <p className="expert-card__title">{loc(e.title)}</p>
                        <p className="small muted">{loc(countryById[e.countryId].name)}</p>
                        <p>{loc(e.bio)}</p>
                        <ul className="chips">
                          {loc(e.expertise).map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                        <button type="button" className="btn btn--primary btn--sm" onClick={() => setActive(e)}>
                          {t('experts.connect')}
                          <span className="visually-hidden"> {e.name}</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )
            }
          </DataLoader>
        </div>
      </section>
      <ConnectModal key={active?.id ?? 'none'} expert={active} onClose={() => setActive(null)} />
    </>
  );
}
