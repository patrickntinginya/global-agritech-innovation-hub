import { Link } from 'react-router-dom';
import AsyncView from '../../components/AsyncView.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import useAsync from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/index.jsx';
import { countByCategory } from '../../services/innovationService.js';
import { categories } from '../../data/categories.js';
import { innovations } from '../../data/innovations.js';
import { knowledgeItems } from '../../data/knowledge.js';
import { courses } from '../../data/courses.js';
import { experts } from '../../data/experts.js';
import { startups } from '../../data/startups.js';
import { discussions } from '../../data/discussions.js';
import { adminMessages, adminUsers } from '../../data/adminData.js';

export default function AdminOverview() {
  const { t, loc } = useI18n();
  usePageTitle(t('admin.sections.overview.title'));
  const counts = useAsync(countByCategory, []);
  const cards = [
    { key: 'innovations', n: innovations.length, to: '/admin/innovations' },
    { key: 'articles', n: knowledgeItems.length, to: '/admin/articles' },
    { key: 'courses', n: courses.length, to: '/admin/courses' },
    { key: 'experts', n: experts.length, to: '/admin/experts' },
    { key: 'startups', n: startups.length, to: '/admin/startups' },
    { key: 'community', n: discussions.length, to: '/admin/community' },
    { key: 'users', n: adminUsers.length, to: '/admin/users' },
    { key: 'messages', n: adminMessages.filter((m) => m.status === 'new').length, to: '/admin/messages' },
  ];
  return (
    <>
      <div className="admin-head"><div><h1>{t('admin.sections.overview.title')}</h1><p className="muted">{t('admin.sections.overview.desc')}</p></div></div>
      <ul className="stat-grid">
        {cards.map((c) => (
          <li key={c.key}>
            <Link to={c.to}>
              <span className="stat__n">{c.n}</span>
              <span className="stat__label">{t(`admin.overview.cards.${c.key}`)}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="dash-grid">
        <section className="panel" aria-labelledby="ov-chart">
          <h2 id="ov-chart">{t('admin.overview.byCategory')}</h2>
          <AsyncView state={counts} rows={2}>
            {(data) => {
              const max = Math.max(1, ...Object.values(data));
              return (
                <ul className="bar-chart">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <span className="bar-chart__label">{loc(c.title)}</span>
                      <span className="bar-chart__track" aria-hidden="true"><span style={{ width: `${((data[c.id] ?? 0) / max) * 100}%` }} /></span>
                      <span className="bar-chart__n">{data[c.id] ?? 0}</span>
                    </li>
                  ))}
                </ul>
              );
            }}
          </AsyncView>
        </section>
        <section className="panel" aria-labelledby="ov-act">
          <h2 id="ov-act">{t('admin.overview.activity')}</h2>
          <p className="muted small">{t('admin.overview.activityNote')}</p>
          <ul className="activity-list">{t('admin.overview.activityItems').map((a) => <li key={a}>{a}</li>)}</ul>
        </section>
      </div>
    </>
  );
}
