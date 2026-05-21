import { useForm } from 'react-hook-form';
import type { Application, ApplicationStatus, WorkLocation } from '../../types';
import { useResumes } from '../../hooks/useResumes';

type FormData = Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'interviewRounds' | 'jdSummary' | 'resume'>;

interface Props {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: Partial<FormData>) => void;
  isLoading?: boolean;
}

const statuses: ApplicationStatus[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'GHOSTED'];
const locations: WorkLocation[] = ['REMOTE', 'HYBRID', 'ONSITE'];

const inputCls = 'w-full bg-[#0f1117] border border-[#2e3248] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8b90a7] focus:outline-none focus:border-[#6c63ff] transition-colors';
const labelCls = 'block text-xs font-medium text-[#8b90a7] mb-1';
const sectionCls = 'border-t border-[#2e3248] pt-4 mt-4';

export default function ApplicationForm({ defaultValues, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, watch } = useForm<FormData>({ defaultValues: defaultValues as FormData });
  const { data: resumes = [] } = useResumes();
  const hasReferral = watch('hasReferral');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
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

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Status</label>
          <select {...register('status')} className={inputCls}>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Work Location</label>
          <select {...register('workLocation')} className={inputCls}>
            <option value="">Not specified</option>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Resume</label>
          <select {...register('resumeId')} className={inputCls}>
            <option value="">None</option>
            {resumes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Min Salary</label>
          <input {...register('salaryMin', { valueAsNumber: true })} type="number" className={inputCls} placeholder="80000" />
        </div>
        <div>
          <label className={labelCls}>Max Salary</label>
          <input {...register('salaryMax', { valueAsNumber: true })} type="number" className={inputCls} placeholder="120000" />
        </div>
        <div>
          <label className={labelCls}>Currency</label>
          <input {...register('salaryCurrency')} className={inputCls} placeholder="USD" defaultValue="USD" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Applied Date</label>
          <input {...register('appliedDate')} type="date" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Deadline Date</label>
          <input {...register('deadlineDate')} type="date" className={inputCls} />
        </div>
      </div>

      <div className={sectionCls}>
        <label className="flex items-center gap-2 text-sm text-[#e8eaf0] cursor-pointer">
          <input {...register('hasReferral')} type="checkbox" className="accent-[#6c63ff]" />
          Has Referral
        </label>
        {hasReferral && (
          <div className="grid grid-cols-2 gap-3 mt-3">
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
        <label className={labelCls}>Job Description (paste raw text for AI summary)</label>
        <textarea {...register('jdRaw')} rows={5} className={inputCls} placeholder="Paste the full job description here..." />
      </div>

      <div>
        <label className={labelCls}>Notes</label>
        <textarea {...register('notes')} rows={3} className={inputCls} />
      </div>

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
