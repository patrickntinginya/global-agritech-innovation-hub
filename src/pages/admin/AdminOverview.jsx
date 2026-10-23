import { Link } from 'react-router-dom';
import DataLoader from '../../components/DataLoader.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import useAsync from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/index.jsx';
import { overviewCounts, recentAudit } from '../../services/adminService.js';

const cards = [
  { key: 'published', field: 'innovPublished', to: '/admin/innovations' },
  { key: 'drafts', field: 'innovDraft', to: '/admin/innovations' },
  { key: 'articles', field: 'articles', to: '/admin/articles' },
  { key: 'courses', field: 'courses', to: '/admin/courses' },
  { key: 'pendingSubmissions', field: 'pendingSubs', to: '/admin/submissions' },
  { key: 'newMessages', field: 'newMessages', to: '/admin/messages' },
  { key: 'members', field: 'members', to: '/admin/users' },
];

// Real counts from the database. Nothing here is invented: an empty database shows zeros and an empty activity list.
export default function AdminOverview() {
  const { t } = useI18n();
  usePageTitle(t('admin.sections.overview.title'));
  const counts = useAsync(overviewCounts, []);
  const audit = useAsync(() => recentAudit(10), []);
  return (
    <>
      <div className="admin-head"><div><h1>{t('admin.sections.overview.title')}</h1><p className="muted">{t('admin.sections.overview.desc')}</p></div></div>
      <DataLoader result={counts} rows={1}>
        {(data) => (
          <ul className="stat-grid">
            {cards.map((c) => (
              <li key={c.key}>
                <Link to={c.to}>
                  <span className="stat__n">{data[c.field]}</span>
                  <span className="stat__label">{t(`admin.ov.${c.key}`)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DataLoader>
      <section className="panel" aria-labelledby="ov-act">
        <h2 id="ov-act">{t('admin.ov.recent')}</h2>
        <p className="muted small">{t('admin.ov.recentNote')}</p>
        <DataLoader result={audit} rows={1}>
          {(events) => (events.length === 0
            ? <p className="muted">{t('admin.ov.noEvents')}</p>
            : (
              <ul className="activity-list">
                {events.map((e) => (
                  <li key={e.id}>{t(`admin.ov.action.${e.action}`)}: {e.table_name} · {String(e.created_at).slice(0, 16).replace('T', ' ')}</li>
                ))}
              </ul>
            ))}
        </DataLoader>
      </section>
    </>
  );
}
