import { useEffect, useState } from 'react';
import SearchField from '../../components/SearchField.jsx';
import Pagination from '../../components/Pagination.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import DataLoader from '../../components/DataLoader.jsx';
import Notice from '../../components/Notice.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import useAsync from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/index.jsx';
import { listMembers } from '../../services/adminService.js';

// Read-only member list. Administrator roles are granted in the Supabase SQL editor (see the README), never from here.
export default function AdminUsers() {
  const { t } = useI18n();
  usePageTitle(t('admin.sections.users.title'));
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const id = setTimeout(() => { setDq(q); setPage(1); }, 250);
    return () => clearTimeout(id);
  }, [q]);
  const result = useAsync(() => listMembers({ q: dq, page }), [dq, page]);
  return (
    <>
      <div className="admin-head"><div><h1>{t('admin.sections.users.title')}</h1><p className="muted">{t('admin.sections.users.desc')}</p></div></div>
      <Notice kind="backend" title={t('admin.users.roleTitle')}>{t('admin.users.roleNote')}</Notice>
      <div className="panel">
        <SearchField label={t('admin.users.search')} value={q} onChange={setQ} placeholder={t('admin.users.searchPlaceholder')} />
        <DataLoader result={result} rows={2}>
          {(data) => (data.total === 0
            ? <EmptyState title={t('admin.users.emptyTitle')} body={t('admin.users.emptyBody')} />
            : (
              <>
                <p className="muted small" aria-live="polite">{t('adm.total', { n: data.total })}</p>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr>{['name', 'type', 'country', 'joined', 'admin'].map((c) => <th scope="col" key={c}>{t(`admin.users.col.${c}`)}</th>)}</tr></thead>
                    <tbody>
                      {data.items.map((m) => (
                        <tr key={m.id}>
                          <td data-label={t('admin.users.col.name')}>{m.display_name}</td>
                          <td data-label={t('admin.users.col.type')}>{m.account_type ? t(`roles.${m.account_type}`) : '—'}</td>
                          <td data-label={t('admin.users.col.country')}>{m.country || '—'}</td>
                          <td data-label={t('admin.users.col.joined')}>{String(m.created_at).slice(0, 10)}</td>
                          <td data-label={t('admin.users.col.admin')}>{m.is_admin ? t('admin.users.yes') : t('admin.users.no')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={data.page} pageCount={data.pageCount} onChange={setPage} />
              </>
            ))}
        </DataLoader>
      </div>
    </>
  );
}
