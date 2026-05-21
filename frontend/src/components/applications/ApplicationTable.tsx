import { useState } from 'react';
import { useApplications, useDeleteApplication } from '../../hooks/useApplications';
import type { Application, ApplicationStatus } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import JDSummary from './JDSummary';
import { Trash2, ExternalLink, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { fmtDate } from '../../lib/dates';

const statuses: ApplicationStatus[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'GHOSTED'];

interface Props {
  onEdit: (app: Application) => void;
  onViewDetail: (app: Application) => void;
}

export default function ApplicationTable({ onEdit, onViewDetail }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [expandedJD, setExpandedJD] = useState<string | null>(null);

  const { data, isLoading } = useApplications({ search, status: filterStatus, page, limit: 20 });
  const deleteApp = useDeleteApplication();

  const apps = data?.data ?? [];
  const total = data?.total ?? 0;

  const formatSalary = (app: Application) => {
    if (!app.salaryMin && !app.salaryMax) return '—';
    const curr = app.salaryCurrency ?? 'USD';
    const fmt = (n: number) => `${curr} ${(n / 1000).toFixed(0)}k`;
    if (app.salaryMin && app.salaryMax) return `${fmt(app.salaryMin)} – ${fmt(app.salaryMax)}`;
    return fmt((app.salaryMin ?? app.salaryMax)!);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b90a7]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search company or role..."
            className="w-full pl-9 pr-3 py-2 bg-[#1a1d27] border border-[#2e3248] rounded-lg text-sm text-white placeholder-[#8b90a7] focus:outline-none focus:border-[#6c63ff]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="bg-[#1a1d27] border border-[#2e3248] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c63ff]"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-sm text-[#8b90a7]">{total} applications</span>
      </div>

      <div className="bg-[#1a1d27] border border-[#2e3248] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2e3248] text-[#8b90a7] text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Company / Role</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Location</th>
              <th className="text-left px-4 py-3 font-medium">Salary</th>
              <th className="text-left px-4 py-3 font-medium">JD Summary</th>
              <th className="text-left px-4 py-3 font-medium">Resume</th>
              <th className="text-left px-4 py-3 font-medium">Applied</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-12 text-[#8b90a7]">Loading...</td></tr>
            ) : apps.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-[#8b90a7]">No applications yet</td></tr>
            ) : (
              apps.map((app) => (
                <>
                  <tr
                    key={app.id}
                    className="border-b border-[#2e3248] hover:bg-[#21253a] transition-colors cursor-pointer"
                    onClick={() => onViewDetail(app)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{app.companyName}</div>
                      <div className="text-[#8b90a7] text-xs mt-0.5">{app.jobTitle}</div>
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
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-[#8b90a7]">
                      {app.workLocation ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[#8b90a7] whitespace-nowrap">
                      {formatSalary(app)}
                    </td>
                    <td className="px-4 py-3 max-w-[180px]" onClick={(e) => e.stopPropagation()}>
                      {app.jdSummary ? (
                        <div>
                          <JDSummary summary={app.jdSummary} compact />
                          <button
                            onClick={() => setExpandedJD(expandedJD === app.id ? null : app.id)}
                            className="flex items-center gap-1 text-xs text-[#8b90a7] hover:text-white mt-1 transition-colors"
                          >
                            {expandedJD === app.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {expandedJD === app.id ? 'Less' : 'More'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#8b90a7]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#8b90a7] text-xs">
                      {app.resume?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[#8b90a7] text-xs whitespace-nowrap">
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
                          className="text-[#8b90a7] hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedJD === app.id && app.jdSummary && (
                    <tr key={`${app.id}-jd`} className="border-b border-[#2e3248] bg-[#21253a]">
                      <td colSpan={8} className="px-4 py-4">
                        <JDSummary summary={app.jdSummary} />
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm bg-[#1a1d27] border border-[#2e3248] rounded-lg text-white disabled:opacity-40 hover:bg-[#21253a] transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-[#8b90a7]">Page {page} of {Math.ceil(total / 20)}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="px-3 py-1.5 text-sm bg-[#1a1d27] border border-[#2e3248] rounded-lg text-white disabled:opacity-40 hover:bg-[#21253a] transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
