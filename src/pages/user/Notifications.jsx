import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle.js';
import useAsync from '../../hooks/useAsync.js';
import DataLoader from '../../components/DataLoader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { deleteNotification, listMyNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/accountService.js';

function List({ initial, userId }) {
  const { t, loc } = useI18n();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  useEffect(() => setItems(initial), [initial]);
  const act = async (fn, apply) => {
    setError(null);
    try { await fn(); setItems(apply); } catch (e) { setError(e); }
  };
  const list = items.filter((n) => filter === 'all' || n.kind === filter);
  return (
    <>
      <div className="filter-chips" role="group" aria-label={t('notifications.filter')}>
        {['all', 'content', 'community', 'learning', 'system'].map((k) => (
          <button key={k} type="button" className={`chip-btn ${filter === k ? 'is-active' : ''}`} aria-pressed={filter === k} onClick={() => setFilter(k)}>
            {k === 'all' ? t('ui.all') : t(`notifications.kinds.${k}`)}
          </button>
        ))}
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => act(() => markAllNotificationsRead(userId), (p) => p.map((n) => ({ ...n, read: true })))}>
          {t('notifications.markAll')}
        </button>
      </div>
      {error && <p className="form-field__error" role="alert">{t(`errors.service.${error.code ?? 'unknown'}.body`)}</p>}
      {list.length === 0 ? (
        <EmptyState title={t('user.notifEmptyTitle')} body={t('user.notifEmptyBody')} />
      ) : (
        <ul className="stack mt">
          {list.map((n) => (
            <li key={n.id} className={`notif ${n.read ? 'is-read' : ''}`}>
              <p className="small muted">{t(`notifications.kinds.${n.kind}`)} · {n.createdAt?.slice(0, 10)}</p>
              <p><strong>{loc(n.title)}</strong></p>
              <p>{loc(n.body)}</p>
              {n.link && <p><Link to={n.link}>{t('actions.learnMore')}</Link></p>}
              {!n.read && <button type="button" className="link-btn" onClick={() => act(() => markNotificationRead(userId, n.id), (p) => p.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}>{t('notifications.markRead')}</button>}{' '}
              <button type="button" className="link-btn" onClick={() => act(() => deleteNotification(userId, n.id), (p) => p.filter((x) => x.id !== n.id))}>{t('notifications.delete')}</button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Notifications() {
  const { t } = useI18n();
  usePageTitle(t('user.nav.notifications'));
  const { user } = useAuth();
  const result = useAsync(() => listMyNotifications(user.id), [user.id]);
  return (
    <>
      <h1>{t('user.nav.notifications')}</h1>
      <p className="lede">{t('notifications.desc')}</p>
      <DataLoader result={result} rows={2}>{(items) => <List initial={items} userId={user.id} />}</DataLoader>
    </>
  );
}
