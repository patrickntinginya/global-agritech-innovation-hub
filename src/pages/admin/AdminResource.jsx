import { useMemo, useState } from 'react';
import SearchField from '../../components/SearchField.jsx';
import FilterSelect from '../../components/FilterSelect.jsx';
import Pagination from '../../components/Pagination.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Modal from '../../components/Modal.jsx';
import PreviewFormModal from '../../components/PreviewFormModal.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import useAsync from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/index.jsx';
import { matchesQuery, paginate } from '../../utils/text.js';

const PAGE_SIZE = 6;

// Generic admin table driven by a config object (see adminConfig.jsx). All edits are kept in
// this component's state only: they are lost on reload and are never sent anywhere.
export default function AdminResource({ config }) {
  const ctx = useI18n();
  const { t } = ctx;
  const title = t(`admin.sections.${config.key}.title`);
  usePageTitle(title);

  const state = useAsync(config.load, [config.key]);
  const [local, setLocal] = useState(null);
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [notice, setNotice] = useState('');

  const rows = local ?? state.data;
  const canAdd = config.canAdd !== false;
  const canEdit = config.canEdit !== false;
  const label = (row) => config.rowLabel(row, ctx);

  const filtered = useMemo(
    () => (rows ?? []).filter((r) => matchesQuery(config.search(r), q) && Object.entries(filters).every(([k, v]) => !v || r[k] === v)),
    [rows, q, filters, config],
  );
  const view = paginate(filtered, page, PAGE_SIZE);

  const commit = (next, noticeKey) => {
    setLocal(next);
    setNotice(t(noticeKey));
  };
  const clearAll = () => { setQ(''); setFilters({}); setPage(1); };

  const onSave = (values) => {
    if (editing.mode === 'add') commit([{ ...config.defaults, ...values, id: `new-${Date.now()}` }, ...rows], 'admin.notice.added');
    else commit(rows.map((r) => (r.id === editing.row.id ? { ...r, ...values } : r)), 'admin.notice.updated');
    setEditing(null);
  };

  const body = () => {
    if (state.error) return <ErrorState onRetry={state.retry} />;
    if (!rows) return <LoadingState rows={4} />;
    if (filtered.length === 0)
      return (
        <EmptyState title={t('admin.emptyTitle')} body={t('admin.emptyBody')}
          action={<div className="btn-row btn-row--center">
            {(q || Object.values(filters).some(Boolean)) && <button type="button" className="btn btn--ghost btn--sm" onClick={clearAll}>{t('common.clearFilters')}</button>}
            {canAdd && <button type="button" className="btn btn--primary btn--sm" onClick={() => setEditing({ mode: 'add', row: null })}>{t('admin.add')}</button>}
          </div>} />
      );
    return (
      <>
        <div className="table-wrap" tabIndex={0} role="region" aria-label={title}>
          <table className="data-table">
            <caption className="visually-hidden">{title}</caption>
            <thead>
              <tr>
                {config.columns.map((c) => <th scope="col" key={c.key}>{t(`admin.cols.${c.key}`)}</th>)}
                <th scope="col">{t('admin.cols.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {view.items.map((row) => (
                <tr key={row.id}>
                  {config.columns.map((c) => <td key={c.key} data-label={t(`admin.cols.${c.key}`)}>{c.cell(row, ctx)}</td>)}
                  <td className="row-actions">
                    {config.viewable && (
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setViewing(row)}>
                        {t('admin.view')}<span className="visually-hidden">: {label(row)}</span>
                      </button>
                    )}
                    {canEdit && (
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing({ mode: 'edit', row })}>
                        {t('admin.edit')}<span className="visually-hidden">: {label(row)}</span>
                      </button>
                    )}
                    {(config.extraActions ?? []).filter((a) => a.when?.(row) ?? true).map((a) => (
                      <button key={a.labelKey} type="button" className="btn btn--ghost btn--sm" onClick={() => commit(rows.map((r) => (r.id === row.id ? a.apply(r) : r)), 'admin.notice.updated')}>
                        {t(a.labelKey)}<span className="visually-hidden">: {label(row)}</span>
                      </button>
                    ))}
                    <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => setDeleting(row)}>
                      {t('admin.delete')}<span className="visually-hidden">: {label(row)}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={view.page} pageCount={view.pageCount} onChange={setPage} />
      </>
    );
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>{title}</h1>
          <p className="muted">{t(`admin.sections.${config.key}.desc`)}</p>
        </div>
        {canAdd && <button type="button" className="btn btn--primary" onClick={() => setEditing({ mode: 'add', row: null })}>{t('admin.add')}</button>}
      </div>

      <form className="filters filters--short" role="search" aria-label={t('admin.filtersLabel')} onSubmit={(e) => e.preventDefault()}>
        <SearchField label={t('admin.searchLabel')} value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={t('admin.searchPlaceholder')} />
        {config.filters.map((f) => (
          <FilterSelect key={f.key} label={t(f.labelKey)} value={filters[f.key] ?? ''} options={f.options(ctx)}
            onChange={(v) => { setFilters((s) => ({ ...s, [f.key]: v })); setPage(1); }} />
        ))}
      </form>

      <p className="muted small" aria-live="polite">
        {rows ? t('explore.showing', view) : t('loading')}
      </p>
      {notice && <p className="notice notice--result" role="status">{notice}</p>}
      {body()}

      {canEdit || canAdd ? (
        <PreviewFormModal
          key={editing ? `${editing.mode}-${editing.row?.id ?? 'new'}` : 'closed'}
          open={Boolean(editing)} onClose={() => setEditing(null)}
          title={editing ? t(editing.mode === 'add' ? 'admin.addTitle' : 'admin.editTitle') : ''} titleId="admin-form-title"
          fields={config.fields ? config.fields(ctx) : []} rules={config.rules ?? {}}
          initial={editing?.row ?? config.defaults ?? {}} submitLabel={t('admin.saveLocal')} showResult={false} onValid={onSave}
        />
      ) : null}

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing ? label(viewing) : ''} titleId="admin-view-title">
        {viewing && config.renderDetail?.(viewing, ctx)}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)} onClose={() => setDeleting(null)}
        title={t('admin.confirmDeleteTitle')} body={deleting ? t('admin.confirmDeleteBody', { name: label(deleting) }) : ''}
        confirmLabel={t('admin.delete')}
        onConfirm={() => { commit(rows.filter((r) => r.id !== deleting.id), 'admin.notice.deleted'); setDeleting(null); }}
      />
    </>
  );
}
