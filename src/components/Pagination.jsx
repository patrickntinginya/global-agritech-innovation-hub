import { useI18n } from '../i18n/index.jsx';

export default function Pagination({ page, pageCount, onChange }) {
  const { t } = useI18n();
  if (pageCount <= 1) return null;
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => start + i);
  return (
    <nav className="pagination" aria-label={t('ui.pagination')}>
      <button type="button" className="btn btn--ghost btn--sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        {t('ui.prev')}
      </button>
      <ul>
        {pages.map((p) => (
          <li key={p}>
            <button
              type="button"
              className={`page-btn ${p === page ? 'is-active' : ''}`}
              aria-current={p === page ? 'page' : undefined}
              aria-label={t('ui.goToPage', { n: p })}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn--ghost btn--sm" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
        {t('ui.next')}
      </button>
      <p className="visually-hidden" aria-live="polite">
        {t('ui.pageOf', { n: page, total: pageCount })}
      </p>
    </nav>
  );
}
