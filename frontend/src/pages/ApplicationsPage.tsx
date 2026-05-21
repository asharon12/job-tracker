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

  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();

  const handleCreate = async (data: Partial<Application>) => {
    await createApp.mutateAsync(data);
    setShowCreate(false);
  };

  const handleUpdate = async (data: Partial<Application>) => {
    if (!editApp) return;
    await updateApp.mutateAsync({ id: editApp.id, data });
    setEditApp(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Applications</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#6c63ff] hover:bg-[#5b53ee] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} /> Add Application
        </button>
      </div>

      <ApplicationTable
        onEdit={(app) => setEditApp(app)}
        onViewDetail={(app) => setDetailApp(app)}
      />

      {showCreate && (
        <Modal title="New Application" onClose={() => setShowCreate(false)} wide>
          <ApplicationForm onSubmit={handleCreate} isLoading={createApp.isPending} />
        </Modal>
      )}

      {editApp && (
        <Modal title="Edit Application" onClose={() => setEditApp(null)} wide>
          <ApplicationForm defaultValues={editApp} onSubmit={handleUpdate} isLoading={updateApp.isPending} />
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
