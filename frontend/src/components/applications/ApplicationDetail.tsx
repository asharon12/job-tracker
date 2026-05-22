import { useState } from 'react';
import { useApplication } from '../../hooks/useApplications';
import { useAddRound, useUpdateRound, useDeleteRound } from '../../hooks/useRounds';
import type { RoundType, RoundOutcome, InterviewRound } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import { fmtDate, fmtDateTime } from '../../lib/dates';
import { Trash2, Plus } from 'lucide-react';

const roundTypes: RoundType[] = ['HR_SCREEN', 'OA', 'DSA', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'CASE_STUDY', 'OTHER'];
const outcomes: RoundOutcome[] = ['PENDING', 'PASSED', 'FAILED', 'CANCELLED'];

const outcomeColors: Record<RoundOutcome, string> = {
  PENDING:   'text-yellow-400',
  PASSED:    'text-green-400',
  FAILED:    'text-red-400',
  CANCELLED: 'text-[var(--text-muted)]',
};

const inputCls = 'bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#6c63ff]';

interface Props { applicationId: string; }

export default function ApplicationDetail({ applicationId }: Props) {
  const { data: app, isLoading } = useApplication(applicationId);
  const addRound = useAddRound(applicationId);
  const updateRound = useUpdateRound(applicationId);
  const deleteRound = useDeleteRound(applicationId);

  const [newRound, setNewRound] = useState<{ roundType: RoundType; scheduledDate: string; scheduledTime: string; notes: string }>({
    roundType: 'HR_SCREEN',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
  });
  const [addingRound, setAddingRound] = useState(false);

  if (isLoading || !app) return <div className="text-[var(--text-muted)] text-sm">Loading...</div>;

  const handleAddRound = async () => {
    let scheduledDate: string | null = null;
    if (newRound.scheduledDate) {
      const datetime = newRound.scheduledTime
        ? `${newRound.scheduledDate}T${newRound.scheduledTime}`
        : `${newRound.scheduledDate}T00:00`;
      scheduledDate = new Date(datetime).toISOString();
    }
    await addRound.mutateAsync({ ...newRound, scheduledDate });
    setAddingRound(false);
    setNewRound({ roundType: 'HR_SCREEN', scheduledDate: '', scheduledTime: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">{app.companyName}</h2>
          <p className="text-[var(--text-muted)] mt-1">{app.jobTitle}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {app.workLocation && <div><span className="text-[var(--text-muted)]">Location: </span><span className="text-[var(--text)]">{app.workLocation}</span></div>}
        {app.salaryMin && (
          <div>
            <span className="text-[var(--text-muted)]">Salary: </span>
            <span className="text-[var(--text)]">{app.salaryCurrency} {(app.salaryMin / 1000).toFixed(0)}k</span>
          </div>
        )}
        {app.appliedDate && <div><span className="text-[var(--text-muted)]">Applied: </span><span className="text-[var(--text)]">{fmtDate(app.appliedDate)}</span></div>}
        {app.resumeName && <div><span className="text-[var(--text-muted)]">Resume: </span><span className="text-[var(--text)]">{app.resumeName}</span></div>}
        {app.hasReferral && app.refereeName && (
          <div><span className="text-[var(--text-muted)]">Referral: </span><span className="text-[var(--text)]">{app.refereeName}</span>{app.refereeRole ? ` (${app.refereeRole})` : ''}</div>
        )}
      </div>

      {app.notes && (
        <div>
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Notes</h3>
          <p className="text-sm text-[var(--text)] bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-3">{app.notes}</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Interview Rounds</h3>
          <button
            onClick={() => setAddingRound(true)}
            className="flex items-center gap-1.5 text-xs text-[#6c63ff] hover:text-[#8b7fff] transition-colors"
          >
            <Plus size={12} /> Add Round
          </button>
        </div>

        {app.interviewRounds.length === 0 && !addingRound && (
          <p className="text-sm text-[var(--text-muted)]">No rounds yet.</p>
        )}

        <div className="space-y-2">
          {app.interviewRounds.map((round) => (
            <RoundRow
              key={round.id}
              round={round}
              onUpdate={(data) => updateRound.mutate({ roundId: round.id, data })}
              onDelete={() => deleteRound.mutate(round.id)}
            />
          ))}
        </div>

        {addingRound && (
          <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-4 mt-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Round Type</label>
                <select
                  value={newRound.roundType}
                  onChange={(e) => setNewRound((r) => ({ ...r, roundType: e.target.value as RoundType }))}
                  className={`${inputCls} w-full`}
                >
                  {roundTypes.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Date</label>
                <input
                  type="date"
                  value={newRound.scheduledDate}
                  onChange={(e) => setNewRound((r) => ({ ...r, scheduledDate: e.target.value }))}
                  className={`${inputCls} w-full`}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Time</label>
                <input
                  type="time"
                  value={newRound.scheduledTime}
                  onChange={(e) => setNewRound((r) => ({ ...r, scheduledTime: e.target.value }))}
                  className={`${inputCls} w-full`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Notes</label>
              <input
                value={newRound.notes}
                onChange={(e) => setNewRound((r) => ({ ...r, notes: e.target.value }))}
                className={`${inputCls} w-full`}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddRound} className="px-3 py-1.5 bg-[#6c63ff] hover:bg-[#5b53ee] text-white text-xs rounded-lg transition-colors">
                Add
              </button>
              <button onClick={() => setAddingRound(false)} className="px-3 py-1.5 bg-[var(--bg-elevated)] text-[var(--text-muted)] text-xs rounded-lg hover:text-[var(--text)] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {app.jdRaw && (
        <div>
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Job Description</h3>
          <p className="text-sm text-[var(--text)] bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-3 whitespace-pre-wrap">{app.jdRaw}</p>
        </div>
      )}
    </div>
  );
}

function RoundRow({
  round,
  onUpdate,
  onDelete,
}: {
  round: InterviewRound;
  onUpdate: (data: Partial<InterviewRound>) => void;
  onDelete: () => void;
}) {
  const [outcome, setOutcome] = useState<RoundOutcome>(round.outcome);

  const handleOutcomeChange = (val: RoundOutcome) => {
    setOutcome(val);
    onUpdate({ outcome: val });
  };

  return (
    <div className="flex items-center gap-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-4 py-3">
      <div className="w-6 h-6 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-xs font-bold text-[#6c63ff] shrink-0">
        {round.roundNumber}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--text)]">{round.roundType.replace(/_/g, ' ')}</div>
        {round.scheduledDate && (
          <div className="text-xs text-[var(--text-muted)] mt-0.5">{fmtDateTime(round.scheduledDate)}</div>
        )}
        {round.notes && <div className="text-xs text-[var(--text-muted)] mt-0.5">{round.notes}</div>}
      </div>
      <select
        value={outcome}
        onChange={(e) => handleOutcomeChange(e.target.value as RoundOutcome)}
        className={`bg-transparent border-0 text-xs font-medium focus:outline-none ${outcomeColors[outcome]}`}
      >
        {outcomes.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <button onClick={onDelete} className="text-[var(--text-muted)] hover:text-red-400 transition-colors">
        <Trash2 size={13} />
      </button>
    </div>
  );
}
