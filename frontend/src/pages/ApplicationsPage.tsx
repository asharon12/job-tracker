import { useState } from 'react';
import { Plus } from 'lucide-react';
import ApplicationTable from '../components/applications/ApplicationTable';
import ApplicationForm from '../components/applications/ApplicationForm';
import ApplicationDetail from '../components/applications/ApplicationDetail';
import Modal from '../components/ui/Modal';
import { useCreateApplication, useUpdateApplication } from '../hooks/useApplications';
import type { Application } from '../types';

export default function ApplicationsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [detailApp, setDetailApp] = useState<Application | null>(null);
  const [tab, setTab] = useState<'active' | 'archived'>('active');

  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();

  const handleCreate = async (data: Partial<Application>) => {
    try {
      await createApp.mutateAsync(data);
      setShowCreate(false);
    } catch (err: unknown) {
      console.error('Failed to create application:', err);
    }
  };

  const handleUpdate = async (data: Partial<Application>) => {
    if (!editApp) return;
    try {
      const { id, userId, createdAt, updatedAt, interviewRounds, resume, ...fields } = data as Application;
      await updateApp.mutateAsync({ id: editApp.id, data: fields });
      setEditApp(null);
    } catch (err: unknown) {
      console.error('Failed to update application:', err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-1">
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'active' ? 'bg-[#6c63ff] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
          >
            Active
          </button>
          <button
            onClick={() => setTab('archived')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'archived' ? 'bg-[#6c63ff] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
          >
            Archived
          </button>
        </div>
        {tab === 'active' && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#6c63ff] hover:bg-[#5b53ee] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Add Application
          </button>
        )}
      </div>

      <ApplicationTable
        tab={tab}
        onEdit={(app) => { updateApp.reset(); setEditApp(app); }}
        onViewDetail={(app) => setDetailApp(app)}
      />

      {showCreate && (
        <Modal title="New Application" onClose={() => setShowCreate(false)} wide>
          <ApplicationForm onSubmit={handleCreate} isLoading={createApp.isPending} error={createApp.error?.message} />
        </Modal>
      )}

      {editApp && (
        <Modal title="Edit Application" onClose={() => setEditApp(null)} wide>
          <ApplicationForm
            defaultValues={{
              ...editApp,
              appliedDate: editApp.appliedDate ? editApp.appliedDate.slice(0, 10) : null,
            }}
            onSubmit={handleUpdate}
            isLoading={updateApp.isPending}
            error={updateApp.error?.message}
          />
        </Modal>
      )}

      {detailApp && (
        <Modal title="Application Detail" onClose={() => setDetailApp(null)} wide>
          <ApplicationDetail applicationId={detailApp.id} />
        </Modal>
      )}
    </div>
  );
}
