import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle.js';
import useAsync from '../../hooks/useAsync.js';
import DataLoader from '../../components/DataLoader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useBookmarks } from '../../context/BookmarksContext.jsx';
import { getInnovationsByIds, getInnovation } from '../../services/innovationService.js';
import { getArticle, getCourse, listArticlesFor, listCoursesFor } from '../../services/contentService.js';
import { getMyProfile, listMyDiscussions, listMyNotifications, listMySubmissions } from '../../services/accountService.js';
import { categoryById } from '../../data/categories.js';

function Panel({ id, title, children, action }) {
  return (
    <section className="panel" aria-labelledby={id}>
      <div className="panel__head">
        <h2 id={id}>{title}</h2>
        <div className="panel__aside">{action}</div>
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const { t, loc } = useI18n();
  usePageTitle(t('user.nav.dashboard'));
  const { user } = useAuth();
  const { ids, articleIds, viewed } = useBookmarks();
  const savedKey = `${[...ids].join(',')}|${[...articleIds].join(',')}`;
  const viewedKey = viewed.map((v) => `${v.kind}:${v.id}`).join(',');

  const data = useAsync(async () => {
    const [profile, notifications, submissions, mine] = await Promise.all([
      getMyProfile(user.id), listMyNotifications(user.id, 20), listMySubmissions(user.id), listMyDiscussions(user.id),
    ]);
    const interest = profile?.interests?.[0] ?? '';
    const [saved, recommended, courses, recent] = await Promise.all([
      getInnovationsByIds([...ids].slice(0, 4)),
      listArticlesFor({ categoryId: interest, limit: 3 }),
      listCoursesFor({ categoryId: interest, limit: 3 }),
      Promise.all(viewed.slice(0, 5).map(async (v) => {
        const item = v.kind === 'innovation' ? await getInnovation(v.id) : v.kind === 'article' ? await getArticle(v.id) : await getCourse(v.id);
        return item && { key: `${v.kind}-${v.id}`, to: `/${v.kind === 'innovation' ? 'innovations' : v.kind === 'article' ? 'library' : 'courses'}/${v.id}`, label: loc(item.title), kind: t(`user.kinds.${v.kind}`) };
      })),
    ]);
    return { profile, notifications, submissions, mine, saved, recommended, courses, recent: recent.filter(Boolean) };
  }, [user.id, savedKey, viewedKey]);

  return (
    <DataLoader result={data} rows={3}>
      {({ profile, notifications, submissions, mine, saved, recommended, courses, recent }) => {
        const unread = notifications.filter((n) => !n.read);
        return (
          <>
            <header className="dash-welcome">
              <div>
                <h1>{t('user.welcome', { name: profile?.displayName ?? '' })}</h1>
                <p className="lede">{t('dash.welcomeBody')}</p>
              </div>
            </header>
            <div className="dash-grid">
              <Panel id="p-profile" title={t('user.profileSummary')} action={<Link to="/profile">{t('user.edit')}</Link>}>
                <dl className="facts">
                  <div><dt>{t('user.role')}</dt><dd>{profile?.role ? t(`roles.${profile.role}`) : t('dash.notSet')}</dd></div>
                  <div><dt>{t('user.country')}</dt><dd>{profile?.country || t('dash.notSet')}</dd></div>
                  <div>
                    <dt>{t('user.interests')}</dt>
                    <dd>
                      {profile?.interests?.length ? (
                        <ul className="chips chips--wrap">
                          {profile.interests.filter((id) => categoryById[id]).map((id) => <li key={id}>{loc(categoryById[id].title)}</li>)}
                        </ul>
                      ) : t('dash.notSet')}
                    </dd>
                  </div>
                </dl>
              </Panel>

              <Panel id="p-saved" title={t('user.savedTitle')} action={<Link to="/saved">{t('user.viewAll')}</Link>}>
                {saved.length === 0 ? (
                  <EmptyState title={t('user.savedEmptyTitle')} body={t('user.savedEmptyBody')} action={<Link to="/explore" className="btn btn--primary btn--sm">{t('actions.explore')}</Link>} />
                ) : (
                  <ul className="plain-list">{saved.map((i) => <li key={i.id}><Link to={`/innovations/${i.id}`}>{loc(i.title)}</Link></li>)}</ul>
                )}
              </Panel>

              <Panel id="p-recent" title={t('user.recentTitle')}>
                {recent.length === 0 ? (
                  <EmptyState title={t('user.recentEmptyTitle')} body={t('user.recentEmptyBody')} />
                ) : (
                  <ul className="plain-list">{recent.map((r) => <li key={r.key}><Link to={r.to}>{r.label}</Link> <span className="small muted">({r.kind})</span></li>)}</ul>
                )}
              </Panel>

              <Panel id="p-reco" title={t('user.recommendedTitle')}>
                {recommended.length === 0 ? <EmptyState title={t('dash.noRecommendations')} /> : (
                  <ul className="plain-list">{recommended.map((a) => <li key={a.id}><Link to={`/library/${a.id}`}>{loc(a.title)}</Link></li>)}</ul>
                )}
              </Panel>

              <Panel id="p-learning" title={t('dash.learningTitle')} action={<Link to="/courses">{t('user.viewAll')}</Link>}>
                {courses.length === 0 ? <EmptyState title={t('dash.noCourses')} /> : (
                  <ul className="plain-list">{courses.map((c) => <li key={c.id}><Link to={`/courses/${c.id}`}>{loc(c.title)}</Link></li>)}</ul>
                )}
              </Panel>

              <Panel id="p-community" title={t('user.communityTitle')} action={<Link to="/community">{t('user.viewAll')}</Link>}>
                {mine.length === 0 ? (
                  <EmptyState title={t('dash.noPosts')} body={t('dash.noPostsBody')} action={<Link to="/community" className="btn btn--primary btn--sm">{t('community.title')}</Link>} />
                ) : (
                  <ul className="plain-list">{mine.map((d) => <li key={d.id}><Link to={`/community/${d.id}`}>{loc(d.title)}</Link></li>)}</ul>
                )}
              </Panel>

              <Panel id="p-subs" title={t('dash.submissionsTitle')} action={<Link to="/submit">{t('actions.submit')}</Link>}>
                {submissions.length === 0 ? <EmptyState title={t('dash.noSubmissions')} body={t('dash.noSubmissionsBody')} /> : (
                  <ul className="plain-list">
                    {submissions.slice(0, 5).map((s) => (
                      <li key={s.id}>{s.title} <span className="badge-pill badge-pill--plain">{t(`dash.status.${s.status}`)}</span></li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel id="p-notifs" title={t('user.notificationsTitle')} action={<Link to="/notifications">{t('user.viewAll')}</Link>}>
                {unread.length === 0 ? (
                  <EmptyState title={t('user.notifEmptyTitle')} body={t('user.notifEmptyBody')} />
                ) : (
                  <ul className="plain-list notif-list">{unread.slice(0, 3).map((n) => <li key={n.id}><p>{loc(n.title)}</p></li>)}</ul>
                )}
              </Panel>

              <Panel id="p-settings" title={t('user.settingsTitle')}>
                <p>{t('user.settingsBody')}</p>
                <Link to="/settings" className="btn btn--ghost btn--sm">{t('user.nav.settings')}</Link>
              </Panel>
            </div>
          </>
        );
      }}
    </DataLoader>
  );
}
