import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import DataLoader from '../components/DataLoader.jsx';
import Notice from '../components/Notice.jsx';
import DemoBadge from '../components/DemoBadge.jsx';
import { TextField } from '../components/forms.jsx';
import NotFound from './NotFound.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import useValidation, { rules } from '../hooks/useValidation.js';
import { useI18n } from '../i18n/index.jsx';
import { getDiscussion } from '../services/contentService.js';
import { acceptReply, createReply } from '../services/accountService.js';
import { useAuth } from '../auth/AuthContext.jsx';

const schema = { reply: [rules.required, rules.min(5)] };

function Discussion({ discussion, reload }) {
  const { t, loc } = useI18n();
  const title = loc(discussion.title);
  usePageTitle(title);
  const [reply, setReply] = useState('');
  const { status: authStatus, user } = useAuth();
  const [state, setState] = useState({ busy: false, error: null });
  const { errors, validate, clearError } = useValidation(schema);

  const submit = async (e) => {
    e.preventDefault();
    if (!validate({ reply })) return;
    setState({ busy: true, error: null });
    try {
      await createReply(user.id, discussion.uuid, reply);
      setReply('');
      setState({ busy: false, error: null });
      reload();
    } catch (err) {
      setState({ busy: false, error: err });
    }
  };
  const accept = async (replyId) => {
    setState({ busy: true, error: null });
    try {
      await acceptReply(replyId);
      setState({ busy: false, error: null });
      reload();
    } catch (err) {
      setState({ busy: false, error: err });
    }
  };

  return (
    <>
      <PageHeader
        title={title}
        demo={discussion.isSample}
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.community'), to: '/community' }, { label: title }]}
      />
      <section className="section section--compact">
        <div className="container narrow">
          {discussion.isSample && (
            <Notice kind="demo" title={t('community.noticeTitle')}>
              {t('community.demoNotice')}
            </Notice>
          )}
          <article className="post">
            <p className="small muted">
              <span className="badge-pill badge-pill--plain">{t(`community.kinds.${discussion.kind}`)}</span>{' '}
              {t(`community.topics.${discussion.topic}`)} · {t('community.by', { name: loc(discussion.author) })} · {discussion.date}
            </p>
            <p>{loc(discussion.body)}</p>
          </article>

          <h2>{t('community.answersTitle', { n: discussion.replies.length })}</h2>
          {discussion.replies.length === 0 && <p className="muted">{t('community.noReplies')}</p>}
          <ul className="stack">
            {discussion.replies.map((r) => (
              <li key={r.id} className={`reply ${r.accepted ? 'reply--accepted' : ''}`}>
                <p className="small muted">
                  {t('community.by', { name: loc(r.author) })}
                  {r.accepted && <span className="answered">{t('community.acceptedAnswer')}</span>} {r.isSample && <DemoBadge compact />}
                </p>
                <p>{loc(r.text)}</p>
                {user?.id && user.id === discussion.authorId && !r.accepted && (
                  <button type="button" className="link-btn" disabled={state.busy} onClick={() => accept(r.id)}>{t('community.markAccepted')}</button>
                )}
              </li>
            ))}
          </ul>

          <h2 className="mt">{t('community.writeReply')}</h2>
          {authStatus !== 'signedIn' ? (
            <Notice kind="info" title={t('community.authTitle')}>
              {t('community.signInToReply')} <Link to={`/signin?next=${encodeURIComponent(`/community/${discussion.id}`)}`}>{t('actions.signIn')}</Link>
            </Notice>
          ) : (
            <form onSubmit={submit} noValidate>
              <TextField
                label={t('community.yourReply')}
                as="textarea"
                rows={4}
                value={reply}
                onValue={(v) => {
                  setReply(v);
                  clearError('reply');
                }}
                error={errors.reply}
                required
                maxLength={2000}
              />
              {state.error && <p className="form-field__error" role="alert">{t(`errors.service.${state.error.code ?? 'unknown'}.body`)}</p>}
              <button type="submit" className="btn btn--primary" disabled={state.busy}>
                {state.busy ? t('account.sending') : t('community.postReply')}
              </button>
            </form>
          )}
          <p>
            <Link to="/community" className="btn btn--ghost btn--sm">
              {t('community.backToList')}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

export default function DiscussionDetail() {
  const { id } = useParams();
  const result = useAsync(() => getDiscussion(id), [id]);
  if (result.status === 'success' && result.data === null) return <NotFound />;
  return <DataLoader result={result}>{(d) => (d ? <Discussion key={d.id} discussion={d} reload={result.reload} /> : null)}</DataLoader>;
}
