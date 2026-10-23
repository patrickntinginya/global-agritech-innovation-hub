import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useBookmarks } from '../context/BookmarksContext.jsx';
import { useI18n } from '../i18n/index.jsx';

// Save / unsave an innovation or article. Saving needs an account, so signed-out visitors get a sign-in link.
export default function SaveButton({ kind = 'innovation', id, title, className = 'btn btn--ghost btn--sm' }) {
  const { t } = useI18n();
  const location = useLocation();
  const { canSave, has, hasArticle, toggle, toggleArticle, actionError } = useBookmarks();
  if (!canSave) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return (
      <Link className={className} to={`/signin?next=${next}`} aria-label={t('account.signInToSave', { title })}>
        <Icon name="bookmark" size={16} />
        {t('actions.save')}
      </Link>
    );
  }
  const saved = kind === 'article' ? hasArticle(id) : has(id);
  const flip = kind === 'article' ? toggleArticle : toggle;
  return (
    <>
      <button
        type="button"
        className={`${className} ${saved ? 'is-saved' : ''}`}
        aria-pressed={saved}
        aria-label={t(saved ? 'a11y.unsaveItem' : 'a11y.saveItem', { title })}
        onClick={() => flip(id)}
      >
        <Icon name="bookmark" size={16} className={saved ? 'icon--filled' : ''} />
        {t(saved ? 'actions.saved' : 'actions.save')}
      </button>
      {actionError && <span className="form-field__error" role="alert">{t(`errors.service.${actionError.code ?? 'unknown'}.title`)}</span>}
    </>
  );
}
