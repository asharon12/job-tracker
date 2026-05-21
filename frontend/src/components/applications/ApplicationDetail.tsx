import { useState } from 'react';
import { useApplication, useSummarizeJD } from '../../hooks/useApplications';
import { useAddRound, useUpdateRound, useDeleteRound } from '../../hooks/useRounds';
import type { RoundType, RoundOutcome, InterviewRound } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import JDSummary from './JDSummary';
import { fmtDate } from '../../lib/dates';
import { Trash2, Plus, Sparkles } from 'lucide-react';

const roundTypes: RoundType[] = ['HR_SCREEN', 'OA', 'DSA', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'CASE_STUDY', 'OTHER'];
const outcomes: RoundOutcome[] = ['PENDING', 'PASSED', 'FAILED', 'CANCELLED'];

const outcomeColors: Record<RoundOutcome, string> = {
  PENDING:   'text-yellow-400',
  PASSED:    'text-green-400',
  FAILED:    'text-red-400',
  CANCELLED: 'text-gray-400',
};

const inputCls = 'bg-[#0f1117] border border-[#2e3248] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8b90a7] focus:outline-none focus:border-[#6c63ff]';

interface Props { applicationId: string; }

export default function ApplicationDetail({ applicationId }: Props) {
  const { data: app, isLoading } = useApplication(applicationId);
  const summarize = useSummarizeJD();
  const addRound = useAddRound(applicationId);
  const updateRound = useUpdateRound(applicationId);
  const deleteRound = useDeleteRound(applicationId);

  const [newRound, setNewRound] = useState<{ roundType: RoundType; scheduledDate: string; notes: string }>({
    roundType: 'HR_SCREEN',
    scheduledDate: '',
    notes: '',
  });
  const [addingRound, setAddingRound] = useState(false);

  if (isLoading || !app) return <div className="text-[#8b90a7] text-sm">Loading...</div>;

  const handleAddRound = async () => {
    await addRound.mutateAsync({ ...newRound, scheduledDate: newRound.scheduledDate || null });
    setAddingRound(false);
    setNewRound({ roundType: 'HR_SCREEN', scheduledDate: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{app.companyName}</h2>
          <p className="text-[#8b90a7] mt-1">{app.jobTitle}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {app.workLocation && <div><span className="text-[#8b90a7]">Location: </span><span className="text-white">{app.workLocation}</span></div>}
        {(app.salaryMin || app.salaryMax) && (
          <div>
            <span className="text-[#8b90a7]">Salary: </span>
            <span className="text-white">
              {[app.salaryMin, app.salaryMax].filter(Boolean).map(n => `${app.salaryCurrency} ${((n ?? 0) / 1000).toFixed(0)}k`).join(' – ')}
            </span>
          </div>
        )}
        {app.appliedDate && <div><span className="text-[#8b90a7]">Applied: </span><span className="text-white">{fmtDate(app.appliedDate)}</span></div>}
        {app.deadlineDate && <div><span className="text-[#8b90a7]">Deadline: </span><span className="text-white">{fmtDate(app.deadlineDate)}</span></div>}
        {app.resume && <div><span className="text-[#8b90a7]">Resume: </span><span className="text-white">{app.resume.name}</span></div>}
        {app.hasReferral && app.refereeName && (
          <div><span className="text-[#8b90a7]">Referral: </span><span className="text-white">{app.refereeName}</span>{app.refereeRole ? ` (${app.refereeRole})` : ''}</div>
        )}
      </div>

      {app.notes && (
        <div>
          <h3 className="text-xs font-semibold text-[#8b90a7] uppercase tracking-wider mb-2">Notes</h3>
          <p className="text-sm text-[#e8eaf0] bg-[#0f1117] border border-[#2e3248] rounded-lg p-3">{app.notes}</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[#8b90a7] uppercase tracking-wider">Interview Rounds</h3>
          <button
            onClick={() => setAddingRound(true)}
            className="flex items-center gap-1.5 text-xs text-[#6c63ff] hover:text-[#8b7fff] transition-colors"
          >
            <Plus size={12} /> Add Round
          </button>
        </div>

        {app.interviewRounds.length === 0 && !addingRound && (
          <p className="text-sm text-[#8b90a7]">No rounds yet.</p>
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
          <div className="bg-[#0f1117] border border-[#2e3248] rounded-lg p-4 mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#8b90a7] mb-1">Round Type</label>
                <select
                  value={newRound.roundType}
                  onChange={(e) => setNewRound((r) => ({ ...r, roundType: e.target.value as RoundType }))}
                  className={`${inputCls} w-full`}
                >
                  {roundTypes.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#8b90a7] mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={newRound.scheduledDate}
                  onChange={(e) => setNewRound((r) => ({ ...r, scheduledDate: e.target.value }))}
                  className={`${inputCls} w-full`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#8b90a7] mb-1">Notes</label>
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
              <button onClick={() => setAddingRound(false)} className="px-3 py-1.5 bg-[#21253a] text-[#8b90a7] text-xs rounded-lg hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[#8b90a7] uppercase tracking-wider">JD Summary</h3>
          {app.jdRaw && (
            <button
              onClick={() => summarize.mutate(applicationId)}
              disabled={summarize.isPending}
              className="flex items-center gap-1.5 text-xs text-[#6c63ff] hover:text-[#8b7fff] disabled:opacity-50 transition-colors"
            >
              <Sparkles size={12} />
              {summarize.isPending ? 'Summarizing...' : app.jdSummary ? 'Re-summarize' : 'Summarize JD'}
            </button>
          )}
        </div>
        {app.jdSummary ? (
          <JDSummary summary={app.jdSummary} />
        ) : (
          <p className="text-sm text-[#8b90a7]">
            {app.jdRaw ? 'Click "Summarize JD" to extract key info with AI.' : 'No job description added.'}
          </p>
        )}
      </div>
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
    <div className="flex items-center gap-3 bg-[#0f1117] border border-[#2e3248] rounded-lg px-4 py-3">
      <div className="w-6 h-6 rounded-full bg-[#21253a] flex items-center justify-center text-xs font-bold text-[#6c63ff] shrink-0">
        {round.roundNumber}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{round.roundType.replace(/_/g, ' ')}</div>
        {round.scheduledDate && (
          <div className="text-xs text-[#8b90a7] mt-0.5">{fmtDate(round.scheduledDate)}</div>
        )}
        {round.notes && <div className="text-xs text-[#8b90a7] mt-0.5">{round.notes}</div>}
      </div>
      <select
        value={outcome}
        onChange={(e) => handleOutcomeChange(e.target.value as RoundOutcome)}
        className={`bg-transparent border-0 text-xs font-medium focus:outline-none ${outcomeColors[outcome]}`}
      >
        {outcomes.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <button onClick={onDelete} className="text-[#8b90a7] hover:text-red-400 transition-colors">
        <Trash2 size={13} />
      </button>
    </div>
  );
}
