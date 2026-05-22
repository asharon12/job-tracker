import { useRef, useState } from 'react';
import { useResumes, useUploadResume, useDeleteResume } from '../hooks/useResumes';
import { Upload, Trash2, FileText, ExternalLink } from 'lucide-react';
import { fmtDate } from '../lib/dates';

export default function ResumesPage() {
  const { data: resumes = [], isLoading } = useResumes();
  const uploadResume = useUploadResume();
  const deleteResume = useDeleteResume();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!name.trim()) { setError('Enter a name before uploading'); return; }
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', name.trim());
    await uploadResume.mutateAsync(fd);
    setName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const inputCls = 'bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#6c63ff]';

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-[var(--text)]">Resumes</h1>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-4">Upload Resume</h2>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Resume name (e.g. SWE 2025)"
            className={`flex-1 ${inputCls}`}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadResume.isPending}
            className="flex items-center gap-2 bg-[#6c63ff] hover:bg-[#5b53ee] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Upload size={14} />
            {uploadResume.isPending ? 'Uploading...' : 'Upload PDF'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        {uploadResume.isError && <p className="text-red-400 text-xs mt-2">Upload failed. Try again.</p>}
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-[var(--text-muted)]">Loading...</p>}
        {!isLoading && resumes.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">No resumes uploaded yet.</p>
        )}
        {resumes.map((r) => (
          <div key={r.id} className="flex items-center gap-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-5 py-4">
            <FileText size={20} className="text-[#6c63ff] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--text)]">{r.name}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                {r.fileName} · Uploaded {fmtDate(r.uploadedAt)}
              </div>
            </div>
            <a
              href={r.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              <ExternalLink size={15} />
            </a>
            <button
              onClick={() => {
                if (confirm('Delete this resume?')) deleteResume.mutate(r.id);
              }}
              className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
