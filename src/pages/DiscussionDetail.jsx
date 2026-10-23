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

const schema = { reply: [rules.required, rules.min(5)] };

function Discussion({ discussion }) {
  const { t, loc } = useI18n();
  const title = loc(discussion.title);
  usePageTitle(title);
  const [reply, setReply] = useState('');
  const [previews, setPreviews] = useState([]); // local only; never sent anywhere
  const { errors, validate, clearError } = useValidation(schema);

  const submit = (e) => {
    e.preventDefault();
    if (!validate({ reply })) return;
    setPreviews((p) => [...p, reply.trim()]);
    setReply('');
  };

  return (
    <>
      <PageHeader
        title={title}
        demo
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.community'), to: '/community' }, { label: title }]}
      />
      <section className="section section--compact">
        <div className="container narrow">
          <Notice kind="demo" title={t('community.noticeTitle')}>
            {t('community.demoNotice')}
          </Notice>
          <article className="post">
            <p className="small muted">
              <span className="badge-pill badge-pill--plain">{t(`community.kinds.${discussion.kind}`)}</span>{' '}
              {t(`community.topics.${discussion.topic}`)} · {t('community.by', { name: loc(discussion.author) })} · {discussion.date}
            </p>
            <p>{loc(discussion.body)}</p>
          </article>

          <h2>{t('community.answersTitle', { n: discussion.replies.length + previews.length })}</h2>
          {discussion.replies.length + previews.length === 0 && <p className="muted">{t('community.noReplies')}</p>}
          <ul className="stack">
            {discussion.replies.map((r) => (
              <li key={r.text.en} className={`reply ${r.accepted ? 'reply--accepted' : ''}`}>
                <p className="small muted">
                  {t('community.by', { name: loc(r.author) })}
                  {r.accepted && <span className="answered">{t('community.acceptedAnswer')}</span>} <DemoBadge compact />
                </p>
                <p>{loc(r.text)}</p>
              </li>
            ))}
            {previews.map((text, i) => (
              <li key={`${text}-${i}`} className="reply reply--preview">
                <p className="small muted">{t('community.yourPreview')}</p>
                <p>{text}</p>
              </li>
            ))}
          </ul>

          <h2 className="mt">{t('community.writeReply')}</h2>
          <Notice kind="backend" title={t('community.authTitle')}>
            {t('community.replyNotice')}
          </Notice>
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
            />
            <button type="submit" className="btn btn--primary">
              {t('community.previewReply')}
            </button>
          </form>
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
  return <DataLoader result={result}>{(d) => (d ? <Discussion key={d.id} discussion={d} /> : null)}</DataLoader>;
}
