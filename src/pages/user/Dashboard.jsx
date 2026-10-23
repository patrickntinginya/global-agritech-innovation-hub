import { useState } from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle.js';
import useAsync from '../../hooks/useAsync.js';
import DataLoader from '../../components/DataLoader.jsx';
import DemoBadge from '../../components/DemoBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { useBookmarks } from '../../context/BookmarksContext.jsx';
import { listInnovations } from '../../services/innovationService.js';
import { listArticles, queryCourses, queryDiscussions } from '../../services/contentService.js';
import { demoUserProfile, demoNotifications, demoLearningActivity, demoCommunityActivity } from '../../data/adminData.js';
import { categoryById } from '../../data/categories.js';

function Panel({ id, title, children, demo = true, action }) {
  return (
    <section className="panel" aria-labelledby={id}>
      <div className="panel__head">
        <h2 id={id}>{title}</h2>
        <div className="panel__aside">
          {demo && <DemoBadge compact />}
          {action}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const { t, loc } = useI18n();
  usePageTitle(t('user.nav.dashboard'));
  const { ids, viewed } = useBookmarks();
  const [dismissed, setDismissed] = useState([]);
  const data = useAsync(async () => {
    const [innovations, articles, courses, discussions] = await Promise.all([listInnovations(), listArticles(), queryCourses({}), queryDiscussions({})]);
    return { innovations, articles, courses, discussions };
  }, []);

  return (
    <DataLoader result={data} rows={3}>
      {({ innovations, articles, courses, discussions }) => {
        const saved = innovations.filter((i) => ids.has(i.id));
        const recent = viewed
          .map((v) => {
            if (v.kind === 'innovation') {
              const i = innovations.find((x) => x.id === v.id);
              return i && { key: `i-${v.id}`, to: `/innovations/${v.id}`, label: loc(i.title), kind: t('user.kinds.innovation') };
            }
            if (v.kind === 'article') {
              const a = articles.find((x) => x.id === v.id);
              return a && { key: `a-${v.id}`, to: `/library/${v.id}`, label: loc(a.title), kind: t('user.kinds.article') };
            }
            const c = courses.find((x) => x.id === v.id);
            return c && { key: `c-${v.id}`, to: `/courses/${v.id}`, label: loc(c.title), kind: t('user.kinds.course') };
          })
          .filter(Boolean);
        const recommended = articles.filter((a) => a.categoryIds.some((c) => demoUserProfile.interests.includes(c))).slice(0, 3);
        const notifications = demoNotifications.filter((n) => !dismissed.includes(n.id));

        return (
          <>
            <header className="dash-welcome">
              <div>
                <h1>{t('user.welcome', { name: demoUserProfile.displayName })}</h1>
                <p className="lede">{t('user.welcomeBody')}</p>
              </div>
              <DemoBadge />
            </header>

            <div className="dash-grid">
              <Panel id="p-profile" title={t('user.profileSummary')} action={<Link to="/profile">{t('user.edit')}</Link>}>
                <dl className="facts">
                  <div>
                    <dt>{t('user.role')}</dt>
                    <dd>{t(`roles.${demoUserProfile.role}`)}</dd>
                  </div>
                  <div>
                    <dt>{t('user.country')}</dt>
                    <dd>{demoUserProfile.country}</dd>
                  </div>
                  <div>
                    <dt>{t('user.interests')}</dt>
                    <dd>
                      <ul className="chips chips--wrap">
                        {demoUserProfile.interests.map((id) => (
                          <li key={id}>{loc(categoryById[id].title)}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </Panel>

              <Panel id="p-saved" title={t('user.savedTitle')} demo={false} action={<Link to="/saved">{t('user.viewAll')}</Link>}>
                {saved.length === 0 ? (
                  <EmptyState title={t('user.savedEmptyTitle')} body={t('user.savedEmptyBody')} action={<Link to="/explore" className="btn btn--primary btn--sm">{t('actions.explore')}</Link>} />
                ) : (
                  <ul className="plain-list">
                    {saved.slice(0, 4).map((i) => (
                      <li key={i.id}>
                        <Link to={`/innovations/${i.id}`}>{loc(i.title)}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel id="p-recent" title={t('user.recentTitle')} demo={false}>
                {recent.length === 0 ? (
                  <EmptyState title={t('user.recentEmptyTitle')} body={t('user.recentEmptyBody')} />
                ) : (
                  <ul className="plain-list">
                    {recent.slice(0, 5).map((r) => (
                      <li key={r.key}>
                        <Link to={r.to}>{r.label}</Link> <span className="small muted">({r.kind})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel id="p-reco" title={t('user.recommendedTitle')}>
                <ul className="plain-list">
                  {recommended.map((a) => (
                    <li key={a.id}>
                      <Link to={`/library/${a.id}`}>{loc(a.title)}</Link>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel id="p-learning" title={t('user.learningTitle')} action={<Link to="/courses">{t('user.viewAll')}</Link>}>
                <ul className="progress-list">
                  {demoLearningActivity.map((l) => {
                    const c = courses.find((x) => x.id === l.courseId);
                    return (
                      <li key={l.courseId}>
                        <Link to={`/courses/${l.courseId}`}>{loc(c.title)}</Link>
                        <div className="progress" role="progressbar" aria-valuenow={l.progress} aria-valuemin="0" aria-valuemax="100" aria-label={loc(c.title)}>
                          <span style={{ width: `${l.progress}%` }} />
                        </div>
                        <span className="small muted">{t('user.progress', { n: l.progress })}</span>
                      </li>
                    );
                  })}
                </ul>
              </Panel>

              <Panel id="p-community" title={t('user.communityTitle')} action={<Link to="/community">{t('user.viewAll')}</Link>}>
                <ul className="plain-list">
                  {demoCommunityActivity.map((a) => {
                    const d = discussions.find((x) => x.id === a.discussionId);
                    return (
                      <li key={a.discussionId}>
                        <span className="small muted">{t(`user.actions.${a.action}`)}:</span> <Link to={`/community/${a.discussionId}`}>{loc(d.title)}</Link>
                      </li>
                    );
                  })}
                </ul>
              </Panel>

              <Panel id="p-notifs" title={t('user.notificationsTitle')} action={<Link to="/notifications">{t('user.viewAll')}</Link>}>
                {notifications.length === 0 ? (
                  <EmptyState title={t('user.notifEmptyTitle')} body={t('user.notifEmptyBody')} />
                ) : (
                  <ul className="plain-list notif-list">
                    {notifications.map((n) => (
                      <li key={n.id}>
                        <p>{loc(n.text)}</p>
                        <button type="button" className="link-btn" onClick={() => setDismissed((d) => [...d, n.id])}>
                          {t('user.dismiss')}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel id="p-settings" title={t('user.settingsTitle')} demo={false}>
                <p>{t('user.settingsBody')}</p>
                <Link to="/settings" className="btn btn--ghost btn--sm">
                  {t('user.nav.settings')}
                </Link>
              </Panel>
            </div>
          </>
        );
      }}
    </DataLoader>
  );
}
