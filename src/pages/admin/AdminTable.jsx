import { useEffect, useState } from 'react';
import SearchField from '../../components/SearchField.jsx';
import FilterSelect from '../../components/FilterSelect.jsx';
import Pagination from '../../components/Pagination.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Modal from '../../components/Modal.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import useAsync from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/index.jsx';
import { categoryById } from '../../data/categories.js';
import { countryById } from '../../data/countries.js';
import { createRow, deleteRow, listRows, setStatus, updateRow } from '../../services/adminService.js';
import AdminForm, { enumLabel } from './AdminForm.jsx';

const PAGE_SIZE = 8;

// Database-backed admin table. Every action calls the database; the success message appears only after the database
// confirmed the change, and a refused change (for example a non-admin session) is shown as an error.
export default function AdminTable({ resourceKey, resource }) {
  const { t, loc } = useI18n();
  const title = t(`admin.sections.${resourceKey}.title`);
  usePageTitle(title);

  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [status, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // { row } | { row: null } for create
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => { setDq(q); setPage(1); }, 250);
    return () => clearTimeout(id);
  }, [q]);

  const result = useAsync(() => listRows(resource, { q: dq, status, page, pageSize: PAGE_SIZE }), [resourceKey, dq, status, page]);
  const canCreate = !resource.moderationOnly && !resource.reviewOnly;
  const statusValues = resource.statusValues ?? ['draft', 'published', 'archived'];
  const label = (row) => resource.titleOf(row, loc);

  const run = async (fn, okKey) => {
    setBusy(true);
    setActionError(null);
    setNotice('');
    try {
      await fn();
      setNotice(t(okKey));
      result.reload();
    } catch (err) {
      setActionError(err);
    } finally {
      setBusy(false);
    }
  };

  const cell = (row, col) => {
    const v = row[col];
    if (col === 'title' || col === 'name' && typeof v === 'object') return resource.titleOf(row, loc);
    if (col === 'country_id') return countryById[v] ? loc(countryById[v].name) : v;
    if (col === 'category_id') return categoryById[v] ? loc(categoryById[v].title) : v;
    if (col === 'status') return <span className={`status-pill status-pill--${v}`}>{enumLabel(t, v)}</span>;
    if (v && typeof v === 'object') return loc(v);
    if (['created_at', 'updated_at'].includes(col)) return String(v ?? '').slice(0, 10);
    return ['kind', 'type', 'level', 'area', 'phase', 'org_type', 'reason', 'topic'].includes(col) ? enumLabel(t, v) : String(v ?? '');
  };

  const body = () => {
    if (result.error) return <ErrorState error={result.error} onRetry={result.retry} />;
    if (!result.data) return <LoadingState rows={4} />;
    const { items, total } = result.data;
    if (items.length === 0) {
      return (
        <EmptyState title={t('admin.emptyTitle')} body={t('admin.emptyBody')}
          action={<div className="btn-row btn-row--center">
            {(q || status) && <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setQ(''); setDq(''); setStatusFilter(''); setPage(1); }}>{t('common.clearFilters')}</button>}
            {canCreate && <button type="button" className="btn btn--primary btn--sm" onClick={() => setEditing({ row: null })}>{t('admin.add')}</button>}
          </div>} />
      );
    }
    return (
      <>
        <p className="muted small" aria-live="polite">{t('adm.total', { n: total })}</p>
        <div className="table-wrap" tabIndex={0} role="region" aria-label={title}>
          <table className="data-table">
            <caption className="visually-hidden">{title}</caption>
            <thead>
              <tr>
                {resource.columns.map((c) => <th scope="col" key={c}>{t(`adm.c.${c}`)}</th>)}
                <th scope="col">{t('admin.cols.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id ?? row[resource.pk]}>
                  {resource.columns.map((c) => <td key={c} data-label={t(`adm.c.${c}`)}>{cell(row, c)}</td>)}
                  <td className="row-actions">
                    {resource.viewFields && <button type="button" className="btn btn--ghost btn--sm" onClick={() => setViewing(row)}>{t('admin.view')}<span className="visually-hidden">: {label(row)}</span></button>}
                    {!resource.moderationOnly && <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing({ row })}>{t(resource.reviewOnly ? 'adm.review' : 'admin.edit')}<span className="visually-hidden">: {label(row)}</span></button>}
                    {resource.publishable && row.status !== 'published' && <button type="button" disabled={busy} className="btn btn--ghost btn--sm" onClick={() => run(() => setStatus({ ...resource, statusColumn: 'status' }, row.id, 'published'), 'adm.done.published')}>{t('adm.publish')}<span className="visually-hidden">: {label(row)}</span></button>}
                    {resource.publishable && row.status === 'published' && <button type="button" disabled={busy} className="btn btn--ghost btn--sm" onClick={() => run(() => setStatus(resource, row.id, 'draft'), 'adm.done.unpublished')}>{t('adm.unpublish')}<span className="visually-hidden">: {label(row)}</span></button>}
                    {resource.publishable && row.status !== 'archived' && <button type="button" disabled={busy} className="btn btn--ghost btn--sm" onClick={() => run(() => setStatus(resource, row.id, 'archived'), 'adm.done.archived')}>{t('adm.archive')}<span className="visually-hidden">: {label(row)}</span></button>}
                    <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => setDeleting(row)}>{t('admin.delete')}<span className="visually-hidden">: {label(row)}</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={result.data.page} pageCount={result.data.pageCount} onChange={setPage} />
      </>
    );
  };

  const saveRow = (row, existing) => (existing ? updateRow(resource, existing.id ?? existing[resource.pk], row) : createRow(resource, row));

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>{title}</h1>
          <p className="muted">{t(`admin.sections.${resourceKey}.desc`)}</p>
        </div>
        {canCreate && <button type="button" className="btn btn--primary" onClick={() => setEditing({ row: null })}>{t('admin.add')}</button>}
      </div>

      <form className="filters filters--short" role="search" aria-label={t('admin.filtersLabel')} onSubmit={(e) => e.preventDefault()}>
        {resource.searchColumn && <SearchField label={t('admin.searchLabel')} value={q} onChange={setQ} placeholder={t('admin.searchPlaceholder')} />}
        {resource.statusColumn && (
          <FilterSelect label={t('adm.c.status')} value={status} options={[{ value: '', label: t('ui.all') }, ...statusValues.map((v) => ({ value: v, label: enumLabel(t, v) }))]}
            onChange={(v) => { setStatusFilter(v); setPage(1); }} />
        )}
      </form>

      {notice && <p className="notice notice--result" role="status">{notice}</p>}
      {actionError && <p className="form-field__error" role="alert">{t(`errors.service.${actionError.code ?? 'unknown'}.body`)}</p>}
      {body()}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing ? t(editing.row ? 'admin.editTitle' : 'admin.addTitle') : ''} titleId="admin-form-title">
        {editing && (
          <AdminForm key={editing.row?.id ?? 'new'} resource={resource} row={editing.row} save={saveRow} onCancel={() => setEditing(null)}
            onSaved={(_saved, created) => { setEditing(null); setNotice(t(created ? 'adm.done.created' : 'adm.done.updated')); result.reload(); }} />
        )}
      </Modal>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing ? label(viewing) : ''} titleId="admin-view-title">
        {viewing && (
          <dl className="facts">
            {resource.viewFields.map((f) => (
              <div key={f}>
                <dt>{t(`adm.f.${f}`)}</dt>
                <dd style={{ whiteSpace: 'pre-wrap' }}>{viewing[f] && typeof viewing[f] === 'object' ? loc(viewing[f]) : String(viewing[f] ?? '—')}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)} onClose={() => setDeleting(null)} title={t('admin.confirmDeleteTitle')}
        body={deleting ? t('admin.confirmDeleteBody', { name: label(deleting) }) : ''} confirmLabel={t('admin.delete')}
        onConfirm={() => { const row = deleting; setDeleting(null); run(() => deleteRow(resource, row.id ?? row[resource.pk]), 'adm.done.deleted'); }}
      />
    </>
  );
}
