import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroArt from '../components/HeroArt.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import CountryCard from '../components/CountryCard.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import InnovationCard from '../components/InnovationCard.jsx';
import CourseCard from '../components/CourseCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import DemoBadge from '../components/DemoBadge.jsx';
import Icon from '../components/Icon.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import { useI18n } from '../i18n/index.jsx';
import { countries } from '../data/countries.js';
import { categories } from '../data/categories.js';
import { courses } from '../data/courses.js';
import { knowledgeItems } from '../data/knowledge.js';
import { communityRoles, partnershipCards } from '../data/community.js';
import { listFeaturedInnovations } from '../services/innovationService.js';

function Hero() {
  const { t } = useI18n();
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="hero__tagline">{t('brand.tagline')}</p>
          <h1 id="hero-title">{t('hero.title')}</h1>
          <p className="hero__desc">{t('hero.desc')}</p>
          <div className="btn-row">
            <Link to="/explore" className="btn btn--accent btn--lg">
              {t('actions.explore')}
            </Link>
            <Link to="/register" className="btn btn--outline-light btn--lg">
              {t('actions.join')}
            </Link>
          </div>
        </div>
        <HeroArt />
      </div>
    </section>
  );
}

function GlobalInnovation() {
  const { t } = useI18n();
  return (
    <section className="section" aria-labelledby="global-title">
      <div className="container">
        <SectionHeader id="global-title" title={t('global.title')} description={t('global.desc')} demo />
        <div className="grid grid--countries">
          {countries.map((c) => (
            <CountryCard key={c.id} country={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const { t } = useI18n();
  return (
    <section className="section section--tint" aria-labelledby="categories-title">
      <div className="container">
        <SectionHeader id="categories-title" title={t('categories.title')} description={t('categories.desc')} />
        <div className="grid grid--categories">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Featured() {
  const { t } = useI18n();
  const [items, setItems] = useState(null);

  useEffect(() => {
    let active = true;
    listFeaturedInnovations().then((list) => active && setItems(list));
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section" aria-labelledby="featured-title">
      <div className="container">
        <SectionHeader id="featured-title" title={t('featured.title')} description={t('featured.desc')} demo>
          <Link to="/explore" className="btn btn--ghost btn--sm">
            {t('featured.browseAll')}
            <Icon name="arrow" size={16} />
          </Link>
        </SectionHeader>
        <ul className="legend" aria-label={t('featured.legend')}>
          <li className="legend__crop">{t('featured.crop')}</li>
          <li className="legend__livestock">{t('featured.livestock')}</li>
        </ul>
        {items === null ? (
          <LoadingState rows={3} />
        ) : (
          <div className="grid grid--cards">
            {items.map((item) => (
              <InnovationCard key={item.id} innovation={item} />
            ))}
          </div>
        )}
        <p className="muted small note">{t('featured.saveNote')}</p>
      </div>
    </section>
  );
}

function Sectors() {
  const { t } = useI18n();
  const blocks = [
    { id: 'crop', tone: 'crop', icon: 'sprout', to: '/smart-farming', ctaKey: 'farming.cropCta' },
    { id: 'livestock', tone: 'livestock', icon: 'cow', to: '/livestock', ctaKey: 'farming.livestockCta' },
  ];
  return (
    <section className="section section--tint" aria-labelledby="farming-title">
      <div className="container">
        <SectionHeader id="farming-title" title={t('farming.title')} description={t('farming.desc')} />
        <div className="sector-grid">
          {blocks.map((b) => (
            <article key={b.id} className={`sector sector--${b.tone}`}>
              <div className="sector__head">
                <Icon name={b.icon} size={30} />
                <h3>{t(`farming.${b.id}Title`)}</h3>
              </div>
              <p>{t(`farming.${b.id}Desc`)}</p>
              <ul>
                {t(`farming.${b.id}Items`).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link to={b.to} className="btn btn--light btn--sm">
                {t(b.ctaKey)}
                <Icon name="arrow" size={16} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Learning() {
  const { t } = useI18n();
  return (
    <section className="section" aria-labelledby="learning-title">
      <div className="container">
        <SectionHeader id="learning-title" title={t('learning.title')} description={t('learning.desc')} demo>
          <Link to="/courses" className="btn btn--ghost btn--sm">
            {t('learning.seeAll')}
            <Icon name="arrow" size={16} />
          </Link>
        </SectionHeader>
        <div className="grid grid--cards">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
        <p className="muted small note">{t('learning.note')}</p>
      </div>
    </section>
  );
}

const typeKeys = ['summary', 'caseStudy', 'cropGuide', 'livestockGuide', 'climate', 'implementation'];

function Research() {
  const { t, loc } = useI18n();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return knowledgeItems.filter((item) => {
      if (type !== 'all' && item.type !== type) return false;
      if (!q) return true;
      return `${loc(item.title)} ${loc(item.summary)}`.toLowerCase().includes(q);
    });
  }, [query, type, loc]);

  const reset = () => {
    setQuery('');
    setType('all');
  };

  return (
    <section className="section section--tint" aria-labelledby="research-title">
      <div className="container">
        <SectionHeader id="research-title" title={t('research.title')} description={t('research.desc')} demo>
          <Link to="/library" className="btn btn--ghost btn--sm">
            {t('research.openLibrary')}
            <Icon name="arrow" size={16} />
          </Link>
        </SectionHeader>

        <div className="toolbar">
          <div className="field field--search">
            <label htmlFor="knowledge-search">{t('research.searchLabel')}</label>
            <div className="field__control">
              <Icon name="search" size={18} />
              <input
                id="knowledge-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('research.searchPlaceholder')}
                autoComplete="off"
              />
            </div>
          </div>
          <div role="group" aria-label={t('research.filterLabel')} className="filter-chips">
            {['all', ...typeKeys].map((key) => (
              <button
                key={key}
                type="button"
                className={`chip-btn ${type === key ? 'is-active' : ''}`}
                aria-pressed={type === key}
                onClick={() => setType(key)}
              >
                {key === 'all' ? t('research.all') : t(`research.types.${key}`)}
              </button>
            ))}
          </div>
        </div>

        <p className="muted small" aria-live="polite">
          {t('research.resultCount', { n: results.length })}
        </p>

        {results.length === 0 ? (
          <EmptyState
            title={t('research.emptyTitle')}
            body={t('research.emptyBody')}
            action={
              <button type="button" className="btn btn--primary btn--sm" onClick={reset}>
                {t('research.reset')}
              </button>
            }
          />
        ) : (
          <ul className="knowledge-list">
            {results.map((item) => (
              <li key={item.id} className="knowledge-item">
                <span className="knowledge-item__type">{t(`research.types.${item.type}`)}</span>
                <h3>{loc(item.title)}</h3>
                <p>{loc(item.summary)}</p>
                <DemoBadge compact />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Community() {
  const { t } = useI18n();
  return (
    <section className="section" aria-labelledby="community-title">
      <div className="container">
        <SectionHeader id="community-title" title={t('community.title')} description={t('community.desc')} />
        <ul className="role-list">
          {communityRoles.map((r) => (
            <li key={r.id}>
              <Icon name={r.icon} size={22} />
              <span>{t(`community.roles.${r.id}`)}</span>
            </li>
          ))}
        </ul>
        <div className="btn-row">
          <Link to="/community" className="btn btn--primary">
            {t('actions.joinDiscussions')}
          </Link>
          <Link to="/submit" className="btn btn--ghost">
            {t('actions.submit')}
          </Link>
        </div>
        <p className="muted small note">{t('community.note')}</p>
      </div>
    </section>
  );
}

function Partnerships() {
  const { t } = useI18n();
  return (
    <section className="section section--tint" aria-labelledby="partners-title">
      <div className="container">
        <SectionHeader id="partners-title" title={t('partners.title')} description={t('partners.desc')} />
        <div className="grid grid--cards">
          {partnershipCards.map((p) => (
            <Link key={p.id} to={p.to} className="partner-card">
              <span className="partner-card__icon">
                <Icon name={p.icon} size={24} />
              </span>
              <h3>{t(`partners.items.${p.id}.title`)}</h3>
              <p>{t(`partners.items.${p.id}.body`)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="final-cta" aria-labelledby="cta-title">
      <div className="container final-cta__inner">
        <h2 id="cta-title">{t('cta.title')}</h2>
        <p>{t('cta.desc')}</p>
        <div className="btn-row btn-row--center">
          <Link to="/register" className="btn btn--accent btn--lg">
            {t('actions.join')}
          </Link>
          <Link to="/submit" className="btn btn--outline-light btn--lg">
            {t('actions.submit')}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useI18n();
  usePageTitle(t('nav.home'));
  return (
    <>
      <Hero />
      <GlobalInnovation />
      <Categories />
      <Featured />
      <Sectors />
      <Learning />
      <Research />
      <Community />
      <Partnerships />
      <FinalCta />
    </>
  );
}
