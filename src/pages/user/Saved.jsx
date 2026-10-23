import { Link } from 'react-router-dom';
import InnovationCard from '../../components/InnovationCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Notice from '../../components/Notice.jsx';
import DataLoader from '../../components/DataLoader.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import useAsync from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/index.jsx';
import { useBookmarks } from '../../context/BookmarksContext.jsx';
import { listInnovations } from '../../services/innovationService.js';

export default function Saved() {
  const { t } = useI18n();
  usePageTitle(t('user.nav.saved'));
  const { ids } = useBookmarks();
  const result = useAsync(listInnovations, []);
  return (
    <>
      <h1>{t('user.nav.saved')}</h1>
      <Notice kind="backend" title={t('saved.noticeTitle')}>
        {t('featured.saveNote')}
      </Notice>
      <DataLoader result={result}>
        {(items) => {
          const saved = items.filter((i) => ids.has(i.id));
          return saved.length === 0 ? (
            <EmptyState
              title={t('user.savedEmptyTitle')}
              body={t('user.savedEmptyBody')}
              action={
                <Link to="/explore" className="btn btn--primary btn--sm">
                  {t('actions.explore')}
                </Link>
              }
            />
          ) : (
            <div className="grid grid--cards">
              {saved.map((i) => (
                <InnovationCard key={i.id} innovation={i} />
              ))}
            </div>
          );
        }}
      </DataLoader>
    </>
  );
}
