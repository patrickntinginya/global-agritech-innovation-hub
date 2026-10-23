import { useState } from 'react';
import EmptyState from '../../components/EmptyState.jsx';
import DemoBadge from '../../components/DemoBadge.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import { useI18n } from '../../i18n/index.jsx';
import { demoNotifications } from '../../data/adminData.js';

export default function Notifications() {
  const { t, loc } = useI18n();
  usePageTitle(t('user.nav.notifications'));
  const [read, setRead] = useState([]);
  const [filter, setFilter] = useState('all');
  const list = demoNotifications.filter((n) => filter === 'all' || n.kind === filter);
  return (
    <>
      <h1>{t('user.nav.notifications')}</h1>
      <p className="lede">{t('notifications.desc')}</p>
      <div className="filter-chips" role="group" aria-label={t('notifications.filter')}>
        {['all', 'content', 'community', 'learning'].map((k) => (
          <button key={k} type="button" className={`chip-btn ${filter === k ? 'is-active' : ''}`} aria-pressed={filter === k} onClick={() => setFilter(k)}>
            {k === 'all' ? t('ui.all') : t(`notifications.kinds.${k}`)}
          </button>
        ))}
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setRead(demoNotifications.map((n) => n.id))}>
          {t('notifications.markAll')}
        </button>
      </div>
      {list.length === 0 ? (
        <EmptyState title={t('user.notifEmptyTitle')} body={t('user.notifEmptyBody')} />
      ) : (
        <ul className="stack mt">
          {list.map((n) => (
            <li key={n.id} className={`notif ${read.includes(n.id) ? 'is-read' : ''}`}>
              <p className="small muted">
                {t(`notifications.kinds.${n.kind}`)} · {n.when} <DemoBadge compact />
              </p>
              <p>{loc(n.text)}</p>
              {!read.includes(n.id) && (
                <button type="button" className="link-btn" onClick={() => setRead((r) => [...r, n.id])}>
                  {t('notifications.markRead')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
