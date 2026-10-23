import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import DataLoader from '../components/DataLoader.jsx';
import Notice from '../components/Notice.jsx';
import NotFound from './NotFound.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import { useI18n } from '../i18n/index.jsx';
import { useBookmarks } from '../context/BookmarksContext.jsx';
import SaveButton from '../components/SaveButton.jsx';
import { getArticle, listArticlesFor } from '../services/contentService.js';
import { categoryById } from '../data/categories.js';

function Article({ article }) {
  const { t, loc } = useI18n();
  const { recordView } = useBookmarks();
  const title = loc(article.title);
  usePageTitle(title);
  const related = useAsync(() => listArticlesFor({ sector: article.sector, excludeId: article.id, limit: 2 }), [article.id]);
  useEffect(() => {
    recordView('article', article.id);
  }, [article.id, recordView]);

  return (
    <>
      <PageHeader
        title={title}
        description={loc(article.summary)}
        demo={article.isSample}
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('library.title'), to: '/library' }, { label: title }]}
      >
        <span className="badge-pill">{t(`research.types.${article.type}`)}</span>
        <SaveButton kind="article" id={article.id} title={title} className="btn btn--ghost" />
      </PageHeader>
      <section className="section section--compact">
        <div className="container article-grid">
          <article className="prose">
            <p className="small muted">
              {t('ui.readMinutes', { n: article.minutes })} · {article.date}
            </p>
            {loc(article.body).map((p) => (
              <p key={p}>{p}</p>
            ))}
            <Notice kind="demo" title={t('article.noticeTitle')}>
              {t('article.notice')}
            </Notice>
            <p>
              <Link to="/library" className="btn btn--ghost btn--sm">
                {t('article.back')}
              </Link>
            </p>
          </article>
          <aside className="detail-side" aria-label={t('article.relatedTitle')}>
            <h2 className="side-heading">{t('article.topics')}</h2>
            <ul className="chips chips--wrap">
              {article.categoryIds.map((id) => (
                <li key={id}>
                  <Link to={`/categories/${id}`}>{loc(categoryById[id].title)}</Link>
                </li>
              ))}
            </ul>
            <h2 className="side-heading">{t('article.relatedTitle')}</h2>
            <DataLoader result={related} rows={1}>
              {(list) => (
                <ul className="stack">
                  {list.map((a) => (
                    <li key={a.id}>
                      <ArticleCard article={a} />
                    </li>
                  ))}
                </ul>
              )}
            </DataLoader>
          </aside>
        </div>
      </section>
    </>
  );
}

export default function ArticleDetail() {
  const { id } = useParams();
  const result = useAsync(() => getArticle(id), [id]);
  if (result.status === 'success' && result.data === null) return <NotFound />;
  return <DataLoader result={result}>{(a) => (a ? <Article key={a.id} article={a} /> : null)}</DataLoader>;
}
