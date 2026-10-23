import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import SearchField from '../components/SearchField.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import DataLoader from '../components/DataLoader.jsx';
import Notice from '../components/Notice.jsx';
import Icon from '../components/Icon.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import { useI18n } from '../i18n/index.jsx';
import { listArticles } from '../services/contentService.js';

const typeKeys = ['summary', 'caseStudy', 'cropGuide', 'livestockGuide', 'climate', 'implementation'];
const typeIcons = { summary: 'layers', caseStudy: 'book', cropGuide: 'sprout', livestockGuide: 'cow', climate: 'sun', implementation: 'chip' };

export default function Research() {
  const { t } = useI18n();
  usePageTitle(t('nav.research'));
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const result = useAsync(listArticles, []);

  const go = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/library?q=${encodeURIComponent(q.trim())}` : '/library');
  };

  return (
    <>
      <PageHeader title={t('nav.research')} description={t('research.desc')} demo crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.research') }]} />
      <section className="section section--compact">
        <div className="container">
          <Notice kind="demo" title={t('research.noticeTitle')}>
            {t('research.notice')}
          </Notice>
          <form onSubmit={go} className="inline-search" role="search">
            <SearchField label={t('research.searchLabel')} value={q} onChange={setQ} placeholder={t('research.searchPlaceholder')} />
            <button type="submit" className="btn btn--primary">
              {t('search.submit')}
            </button>
          </form>

          <DataLoader result={result}>
            {(items) => (
              <>
                <h2 className="mt">{t('research.browseByType')}</h2>
                <ul className="grid grid--categories">
                  {typeKeys.map((key) => (
                    <li key={key}>
                      <Link className="category-card" to={`/library?type=${key}`}>
                        <span className="category-card__icon">
                          <Icon name={typeIcons[key]} size={26} />
                        </span>
                        <span className="category-card__title">{t(`research.types.${key}`)}</span>
                        <span className="category-card__count">{t('ui.itemsCount', { n: items.filter((a) => a.type === key).length })}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="section-header mt">
                  <h2>{t('research.latest')}</h2>
                  <Link to="/library" className="btn btn--ghost btn--sm">
                    {t('research.openLibrary')}
                  </Link>
                </div>
                <ul className="knowledge-list">
                  {[...items]
                    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
                    .slice(0, 6)
                    .map((a) => (
                      <li key={a.id}>
                        <ArticleCard article={a} />
                      </li>
                    ))}
                </ul>
              </>
            )}
          </DataLoader>
        </div>
      </section>
    </>
  );
}
