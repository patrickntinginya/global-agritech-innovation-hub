import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import SearchField from '../components/SearchField.jsx';
import DataLoader from '../components/DataLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import DemoBadge from '../components/DemoBadge.jsx';
import Modal from '../components/Modal.jsx';
import Notice from '../components/Notice.jsx';
import Icon from '../components/Icon.jsx';
import { TextField, SelectField } from '../components/forms.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import useFilters from '../hooks/useFilters.js';
import useValidation, { rules } from '../hooks/useValidation.js';
import { useI18n } from '../i18n/index.jsx';
import { queryDiscussions } from '../services/contentService.js';
import { createDiscussion } from '../services/accountService.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { discussionTopics } from '../data/discussions.js';
import { communityRoles } from '../data/community.js';

const defaults = { q: '', topic: 'all', kind: 'all' };
const schema = { title: [rules.required, rules.min(8)], body: [rules.required, rules.min(15)] };

function StartDiscussion({ open, onClose }) {
  const { t } = useI18n();
  const { status, user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({ busy: false, error: null });
  const [form, setForm] = useState({ title: '', topic: 'crops', body: '' });
  const { errors, validate, clearError } = useValidation(schema);
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    clearError(k);
  };
  return (
    <Modal open={open} onClose={onClose} title={t('community.startTitle')} titleId="start-title">
      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          if (status !== 'signedIn' || !validate(form)) return;
          setState({ busy: true, error: null });
          try {
            const slug = await createDiscussion(user.id, { ...form, kind: form.body.trim().endsWith('?') || form.title.trim().endsWith('?') ? 'question' : 'discussion' });
            onClose();
            navigate(`/community/${slug}`);
          } catch (err) {
            setState({ busy: false, error: err });
          }
        }}
      >
        {status !== 'signedIn' && (
          <Notice kind="info" title={t('community.authTitle')}>
            {t('community.signInToPost')} <Link to="/signin?next=%2Fcommunity">{t('actions.signIn')}</Link>
          </Notice>
        )}
        <TextField label={t('community.postTitle')} value={form.title} onValue={set('title')} error={errors.title} required />
        <SelectField label={t('community.topic')} value={form.topic} onValue={set('topic')} options={discussionTopics.map((k) => ({ value: k, label: t(`community.topics.${k}`) }))} />
        <TextField label={t('community.postBody')} as="textarea" value={form.body} onValue={set('body')} error={errors.body} required />
        {state.error && <p className="form-field__error" role="alert">{t(`errors.service.${state.error.code ?? 'unknown'}.body`)}</p>}
        <div className="btn-row">
          <button type="submit" className="btn btn--primary" disabled={state.busy || status !== 'signedIn'}>
            {state.busy ? t('account.sending') : t('community.publishPost')}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t('actions.close')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Community() {
  const { t, loc } = useI18n();
  usePageTitle(t('nav.community'));
  const { values, setValues, reset, activeCount } = useFilters(defaults);
  const result = useAsync(() => queryDiscussions(values), [values.q, values.topic, values.kind]);
  const [startOpen, setStartOpen] = useState(false);

  return (
    <>
      <PageHeader title={t('nav.community')} description={t('community.desc')} demo crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.community') }]}>
        <button type="button" className="btn btn--primary" onClick={() => setStartOpen(true)}>
          {t('community.start')}
        </button>
      </PageHeader>

      <section className="section section--compact">
        <div className="container community-grid">
          <div>
            <div className="toolbar">
              <SearchField label={t('community.searchLabel')} value={values.q} onChange={(q) => setValues({ q })} placeholder={t('community.searchPlaceholder')} />
              <div role="group" aria-label={t('community.topic')} className="filter-chips">
                {['all', ...discussionTopics].map((k) => (
                  <button key={k} type="button" className={`chip-btn ${values.topic === k ? 'is-active' : ''}`} aria-pressed={values.topic === k} onClick={() => setValues({ topic: k })}>
                    {k === 'all' ? t('ui.all') : t(`community.topics.${k}`)}
                  </button>
                ))}
              </div>
              <div role="group" aria-label={t('community.kind')} className="filter-chips">
                {['all', 'question', 'discussion'].map((k) => (
                  <button key={k} type="button" className={`chip-btn ${values.kind === k ? 'is-active' : ''}`} aria-pressed={values.kind === k} onClick={() => setValues({ kind: k })}>
                    {k === 'all' ? t('ui.all') : t(`community.kinds.${k}`)}
                  </button>
                ))}
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
                  <EmptyState title={t('community.emptyTitle')} body={t('community.emptyBody')} />
                ) : (
                  <ul className="stack">
                    {list.map((d) => (
                      <li key={d.id} className="discussion-row">
                        <div className="discussion-row__meta">
                          <span className="badge-pill badge-pill--plain">{t(`community.kinds.${d.kind}`)}</span>
                          <span className="small muted">{t(`community.topics.${d.topic}`)}</span>
                          {d.answered && <span className="answered">{t('community.answered')}</span>}
                          <DemoBadge compact />
                        </div>
                        <h3>
                          <Link to={`/community/${d.id}`} className="card-link">
                            {loc(d.title)}
                          </Link>
                        </h3>
                        <p className="small muted">
                          {t('community.by', { name: loc(d.author) })} · {t('community.replies', { n: d.replies.length })}
                        </p>
                      </li>
                    ))}
                  </ul>
                )
              }
            </DataLoader>
          </div>

          <aside className="community-side" aria-label={t('community.participate')}>
            <h2 className="side-heading">{t('community.participate')}</h2>
            <ul className="prompt-list">
              {['ask', 'share', 'submit'].map((k) => (
                <li key={k}>
                  <p><strong>{t(`community.prompts.${k}.title`)}</strong><br />{t(`community.prompts.${k}.body`)}</p>
                </li>
              ))}
            </ul>
            <Link to="/submit" className="btn btn--ghost btn--sm">
              {t('actions.submit')}
            </Link>
            <h2 className="side-heading">{t('community.whoTitle')}</h2>
            <ul className="role-list role-list--stack">
              {communityRoles.map((r) => (
                <li key={r.id}>
                  <Icon name={r.icon} size={20} />
                  <span>{t(`community.roles.${r.id}`)}</span>
                </li>
              ))}
            </ul>
            <Notice kind="info" title={t('community.authTitle')}>
              {t('community.authNoticeReal')}
            </Notice>
          </aside>
        </div>
      </section>
      <StartDiscussion key={startOpen ? 'open' : 'closed'} open={startOpen} onClose={() => setStartOpen(false)} />
    </>
  );
}
