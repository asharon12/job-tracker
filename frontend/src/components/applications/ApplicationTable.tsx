import { Fragment, useState } from 'react';
import { useApplications, useDeleteApplication, useUpdateApplication } from '../../hooks/useApplications';
import type { Application, ApplicationStatus } from '../../types';
import { Trash2, ExternalLink, Search } from 'lucide-react';
import { fmtDate } from '../../lib/dates';

const activeStatuses: ApplicationStatus[] = ['APPLIED', 'AWAITING_REFERRAL', 'SCREENING', 'INTERVIEW', 'OFFER'];
const archivedStatuses: ApplicationStatus[] = ['REJECTED', 'GHOSTED'];
const allStatuses: ApplicationStatus[] = [...activeStatuses, ...archivedStatuses];
const statusLabel: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied', AWAITING_REFERRAL: 'Awaiting Referral',
  SCREENING: 'Screening', INTERVIEW: 'Interview',
  OFFER: 'Offer', REJECTED: 'Rejected', GHOSTED: 'Ghosted',
};
const statusColors: Record<ApplicationStatus, string> = {
  APPLIED:           'bg-blue-500/15 text-blue-400 border-blue-500/30',
  AWAITING_REFERRAL: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  SCREENING:         'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  INTERVIEW:         'bg-purple-500/15 text-purple-400 border-purple-500/30',
  OFFER:             'bg-green-500/15 text-green-400 border-green-500/30',
  REJECTED:          'bg-red-500/15 text-red-400 border-red-500/30',
  GHOSTED:           'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

function StatusSelect({ app }: { app: Application }) {
  const update = useUpdateApplication();
  const [value, setValue] = useState<ApplicationStatus>(app.status);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as ApplicationStatus;
    setValue(next);
    update.mutate({ id: app.id, data: { status: next } });
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      className={`text-xs font-medium border rounded-full px-2 py-0.5 cursor-pointer focus:outline-none appearance-none ${statusColors[value]}`}
    >
      {allStatuses.map((s) => (
        <option key={s} value={s} className="bg-[var(--bg-surface)] text-[var(--text)]">
          {statusLabel[s]}
        </option>
      ))}
    </select>
  );
}

interface Props {
  tab: 'active' | 'archived';
  onEdit: (app: Application) => void;
  onViewDetail: (app: Application) => void;
}

export default function ApplicationTable({ tab, onEdit, onViewDetail }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const isArchived = tab === 'archived';
  const { data, isLoading } = useApplications({ search, status: isArchived ? '' : filterStatus, page, limit: 20, archived: isArchived });
  const deleteApp = useDeleteApplication();

  const apps = data?.data ?? [];
  const total = data?.total ?? 0;

  const formatSalary = (app: Application) => {
    if (!app.salaryMin) return '—';
    const curr = app.salaryCurrency ?? 'USD';
    return `${curr} ${(app.salaryMin / 1000).toFixed(0)}k`;
  };

  const inputBase = 'bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-[#6c63ff]';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search company or role..."
            className={`w-full pl-9 pr-3 py-2 ${inputBase} placeholder-[var(--text-muted)]`}
          />
        </div>
        {!isArchived && (
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className={`px-3 py-2 ${inputBase}`}
          >
            <option value="">All Active</option>
            {activeStatuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
          </select>
        )}
        <span className="text-sm text-[var(--text-muted)]">{total} {isArchived ? 'archived' : 'applications'}</span>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden flex flex-col gap-3">
        {isLoading ? (
          <p className="text-center py-12 text-[var(--text-muted)] text-sm">Loading...</p>
        ) : apps.length === 0 ? (
          <p className="text-center py-12 text-[var(--text-muted)] text-sm">{isArchived ? 'No archived applications' : 'No applications yet'}</p>
        ) : (
          apps.map((app) => (
            <div
              key={app.id}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 cursor-pointer active:opacity-80 transition-opacity"
              onClick={() => onViewDetail(app)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--text)] truncate">{app.companyName}</div>
                  <div className="text-xs text-[var(--text-muted)] truncate mt-0.5">{app.jobTitle}</div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <StatusSelect app={app} />
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] mb-2">
                {app.workLocation && <span>{app.workLocation}</span>}
                {app.appliedDate && <span>{fmtDate(app.appliedDate)}</span>}
                {app.salaryMin && <span>{app.salaryCurrency} {(app.salaryMin / 1000).toFixed(0)}k</span>}
              </div>
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                {app.jobUrl && (
                  <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#6c63ff]">
                    <ExternalLink size={10} /> Link
                  </a>
                )}
                <button onClick={() => onEdit(app)} className="text-xs text-[#6c63ff]">Edit</button>
                <button
                  onClick={() => { if (confirm('Delete this application?')) deleteApp.mutate(app.id); }}
                  className="text-[var(--text-muted)] hover:text-red-400 transition-colors ml-auto"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Company / Role</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Location</th>
              <th className="text-left px-4 py-3 font-medium">Salary</th>
              <th className="text-left px-4 py-3 font-medium">Resume</th>
              <th className="text-left px-4 py-3 font-medium">Applied</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-[var(--text-muted)]">Loading...</td></tr>
            ) : apps.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-[var(--text-muted)]">{isArchived ? 'No archived applications' : 'No applications yet'}</td></tr>
            ) : (
              apps.map((app) => (
                <Fragment key={app.id}>
                  <tr
                    className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                    onClick={() => onViewDetail(app)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text)]">{app.companyName}</div>
                      <div className="text-[var(--text-muted)] text-xs mt-0.5">{app.jobTitle}</div>
                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#6c63ff] hover:underline mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={10} /> Job link
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect app={app} />
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {app.workLocation ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">
                      {formatSalary(app)}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                      {app.resumeName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs whitespace-nowrap">
                      {app.appliedDate ? fmtDate(app.appliedDate) : '—'}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(app)}
                          className="text-xs text-[#6c63ff] hover:text-[#8b7fff] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this application?')) deleteApp.mutate(app.id);
                          }}
                          className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>{/* end desktop table */}

      {total > 20 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] disabled:opacity-40 hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--text-muted)]">Page {page} of {Math.ceil(total / 20)}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="px-3 py-1.5 text-sm bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] disabled:opacity-40 hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
