import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import CourseCard from '../components/CourseCard.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import DataLoader from '../components/DataLoader.jsx';
import Notice from '../components/Notice.jsx';
import Icon from '../components/Icon.jsx';
import NotFound from './NotFound.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import { useI18n } from '../i18n/index.jsx';
import { useBookmarks } from '../context/BookmarksContext.jsx';
import { getCourse, listCoursesFor, listArticlesFor } from '../services/contentService.js';
import { categoryById } from '../data/categories.js';

function Course({ course }) {
  const { t, loc } = useI18n();
  const { recordView } = useBookmarks();
  const title = loc(course.title);
  usePageTitle(title);
  const relatedCourses = useAsync(() => listCoursesFor({ sector: course.sector, excludeId: course.id, limit: 2 }), [course.id]);
  const relatedArticles = useAsync(() => listArticlesFor({ categoryId: course.categoryIds[0], limit: 2 }), [course.id]);
  useEffect(() => {
    recordView('course', course.id);
  }, [course.id, recordView]);

  return (
    <>
      <PageHeader
        title={title}
        description={loc(course.description)}
        demo
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.learning'), to: '/courses' }, { label: title }]}
      />
      <section className="section section--compact">
        <div className="container detail-grid">
          <div className="detail-main">
            <Notice kind="demo" title={t('courses.noticeTitle')}>
              {t('learning.note')}
            </Notice>
            <h2 className="mt">{t('courseDetail.modules')}</h2>
            <ol className="module-list">
              {loc(course.modules).map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ol>
            <h2>{t('courseDetail.topics')}</h2>
            <ul className="chips chips--wrap">
              {course.categoryIds.map((id) => (
                <li key={id}>
                  <Link to={`/categories/${id}`}>{loc(categoryById[id].title)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <aside className="detail-side" aria-label={t('detail.facts')}>
            <h2 className="side-heading">{t('detail.facts')}</h2>
            <dl className="facts">
              <div>
                <dt>{t('courses.level')}</dt>
                <dd>{t(`learning.level.${course.level}`)}</dd>
              </div>
              <div>
                <dt>{t('courseDetail.duration')}</dt>
                <dd>{t('learning.duration', { n: course.weeks })}</dd>
              </div>
              <div>
                <dt>{t('courses.topic')}</dt>
                <dd>{t(`courses.topics.${course.topic}`)}</dd>
              </div>
            </dl>
            <button type="button" className="btn btn--primary" disabled aria-describedby="enrol-note">
              <Icon name="book" size={18} />
              {t('courseDetail.enrol')}
            </button>
            <p className="small muted" id="enrol-note">
              {t('courseDetail.enrolNote')}
            </p>
            <Link to="/courses" className="btn btn--ghost btn--sm">
              {t('courseDetail.back')}
            </Link>
          </aside>
        </div>
      </section>
      <section className="section section--tint section--compact">
        <div className="container">
          <h2>{t('courseDetail.relatedLearning')}</h2>
          <DataLoader result={relatedCourses} rows={2}>
            {(list) => (
              <div className="grid grid--cards">
                {list.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            )}
          </DataLoader>
          <h2 className="mt">{t('courseDetail.relatedReading')}</h2>
          <DataLoader result={relatedArticles} rows={2}>
            {(list) =>
              list.length === 0 ? (
                <p className="muted">{t('categoryPage.noRelated')}</p>
              ) : (
                <ul className="knowledge-list">
                  {list.map((a) => (
                    <li key={a.id}>
                      <ArticleCard article={a} />
                    </li>
                  ))}
                </ul>
              )
            }
          </DataLoader>
        </div>
      </section>
    </>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const result = useAsync(() => getCourse(id), [id]);
  if (result.status === 'success' && result.data === null) return <NotFound />;
  return <DataLoader result={result}>{(c) => (c ? <Course key={c.id} course={c} /> : null)}</DataLoader>;
}
