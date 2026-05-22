import { useForm } from 'react-hook-form';
import type { Application, ApplicationStatus } from '../../types';

type FormData = Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'interviewRounds' | 'resume'>;

interface Props {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: Partial<FormData>) => void;
  isLoading?: boolean;
  error?: string;
}

const statuses: { value: ApplicationStatus; label: string }[] = [
  { value: 'APPLIED',           label: 'Applied' },
  { value: 'AWAITING_REFERRAL', label: 'Awaiting Referral' },
  { value: 'SCREENING',         label: 'Screening' },
  { value: 'INTERVIEW',         label: 'Interview' },
  { value: 'OFFER',             label: 'Offer' },
  { value: 'REJECTED',          label: 'Rejected' },
  { value: 'GHOSTED',           label: 'Ghosted' },
];

const inputCls = 'w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#6c63ff] transition-colors';
const labelCls = 'block text-xs font-medium text-[var(--text-muted)] mb-1';
const sectionCls = 'border-t border-[var(--border)] pt-4 mt-4';

export default function ApplicationForm({ defaultValues, onSubmit, isLoading, error }: Props) {
  const { register, handleSubmit, watch } = useForm<FormData>({ defaultValues: defaultValues as FormData });
  const hasReferral = watch('hasReferral');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Company *</label>
          <input {...register('companyName', { required: true })} className={inputCls} placeholder="Google" />
        </div>
        <div>
          <label className={labelCls}>Job Title *</label>
          <input {...register('jobTitle', { required: true })} className={inputCls} placeholder="Software Engineer" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Job URL</label>
        <input {...register('jobUrl')} type="url" className={inputCls} placeholder="https://..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Status</label>
          <select {...register('status')} className={inputCls}>
            {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input {...register('workLocation')} className={inputCls} placeholder="e.g. San Francisco, CA" />
        </div>
        <div>
          <label className={labelCls}>Resume</label>
          <input {...register('resumeName')} className={inputCls} placeholder="e.g. Google_SWE_Resume.pdf" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Salary</label>
          <input {...register('salaryMin', { setValueAs: (v) => v === '' || v === null || v === undefined ? null : Number(v) })} type="number" className={inputCls} placeholder="120000" />
        </div>
        <div>
          <label className={labelCls}>Currency</label>
          <input {...register('salaryCurrency')} className={inputCls} placeholder="USD" defaultValue="USD" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Applied Date</label>
        <input {...register('appliedDate')} type="date" className={inputCls} />
      </div>

      <div className={sectionCls}>
        <label className="flex items-center gap-2 text-sm text-[var(--text)] cursor-pointer">
          <input {...register('hasReferral')} type="checkbox" className="accent-[#6c63ff]" />
          Has Referral
        </label>
        {hasReferral && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className={labelCls}>Referee Name</label>
              <input {...register('refereeName')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Referee Role</label>
              <input {...register('refereeRole')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Referee Company</label>
              <input {...register('refereeCompany')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Referee LinkedIn</label>
              <input {...register('refereeLinkedin')} className={inputCls} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>
        )}
      </div>

      <div className={sectionCls}>
        <label className={labelCls}>Job Description</label>
        <textarea {...register('jdRaw')} rows={5} className={inputCls} placeholder="Paste the full job description here..." />
      </div>

      <div>
        <label className={labelCls}>Notes</label>
        <textarea {...register('notes')} rows={3} className={inputCls} />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#6c63ff] hover:bg-[#5b53ee] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Application'}
        </button>
      </div>
    </form>
  );
}
