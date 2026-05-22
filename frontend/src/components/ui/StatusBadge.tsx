import type { ApplicationStatus } from '../../types';

const config: Record<ApplicationStatus, { label: string; className: string }> = {
  APPLIED:            { label: 'Applied',           className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  AWAITING_REFERRAL:  { label: 'Awaiting Referral', className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  SCREENING:          { label: 'Screening',         className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  INTERVIEW:          { label: 'Interview',         className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  OFFER:              { label: 'Offer',             className: 'bg-green-500/15 text-green-400 border-green-500/30' },
  REJECTED:           { label: 'Rejected',          className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  GHOSTED:            { label: 'Ghosted',           className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}
