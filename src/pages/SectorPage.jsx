import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import InnovationCard from '../components/InnovationCard.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import CourseCard from '../components/CourseCard.jsx';
import DataLoader from '../components/DataLoader.jsx';
import Icon from '../components/Icon.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import { useI18n } from '../i18n/index.jsx';
import { queryInnovations } from '../services/innovationService.js';
import { listArticlesFor, listCoursesFor } from '../services/contentService.js';
import { sectorConfig } from '../data/sectors.js';

// One page component serves both /smart-farming (crop) and /livestock.
export default function SectorPage({ sector }) {
  const { t } = useI18n();
  const cfg = sectorConfig[sector];
  usePageTitle(t(cfg.titleKey));
  const items = useAsync(() => queryInnovations({ sector, pageSize: 3 }), [sector]);
  const articles = useAsync(() => listArticlesFor({ sector }), [sector]);
  const courses = useAsync(() => listCoursesFor({ sector }), [sector]);
  const topics = t(cfg.itemsKey);

  return (
    <>
      <PageHeader title={t(cfg.titleKey)} description={t(cfg.introKey)} demo crumbs={[{ label: t('nav.home'), to: '/' }, { label: t(cfg.titleKey) }]}>
        <span className="category-card__icon category-card__icon--lg">
          <Icon name={cfg.icon} size={32} />
        </span>
      </PageHeader>

      <section className="section section--compact" aria-labelledby="topics-title">
        <div className="container">
          <h2 id="topics-title">{t('sectorPage.topics')}</h2>
          <p className="lede">{t(cfg.descKey)}</p>
          <ul className="topic-grid">
            {topics.map((topic, i) => (
              <li key={topic}>
                <Link to={cfg.topicLinks[i]} className="topic-link">
                  <span>{topic}</span>
                  <Icon name="arrow" size={18} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--tint section--compact" aria-labelledby="sector-innovations">
        <div className="container">
          <div className="section-header">
            <h2 id="sector-innovations">{t('sectorPage.innovations')}</h2>
            <Link to={`/explore?sector=${sector}`} className="btn btn--ghost btn--sm">
              {t('featured.browseAll')}
            </Link>
          </div>
          <DataLoader result={items}>
            {(data) => (
              <div className="grid grid--cards">
                {data.items.map((i) => (
                  <InnovationCard key={i.id} innovation={i} />
                ))}
              </div>
            )}
          </DataLoader>
        </div>
      </section>

      <section className="section section--compact" aria-labelledby="sector-learning">
        <div className="container">
          <h2 id="sector-learning">{t('sectorPage.learning')}</h2>
          <DataLoader result={courses} rows={2}>
            {(list) => (
              <div className="grid grid--cards">
                {list.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            )}
          </DataLoader>
        </div>
      </section>

      <section className="section section--tint section--compact" aria-labelledby="sector-research">
        <div className="container">
          <h2 id="sector-research">{t('sectorPage.research')}</h2>
          <DataLoader result={articles} rows={2}>
            {(list) => (
              <ul className="knowledge-list">
                {list.map((a) => (
                  <li key={a.id}>
                    <ArticleCard article={a} />
                  </li>
                ))}
              </ul>
            )}
          </DataLoader>
        </div>
      </section>
    </>
  );
}
