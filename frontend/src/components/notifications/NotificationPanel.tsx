import { useNotifications, useMarkRead, useMarkAllRead, useDeleteNotification } from '../../hooks/useNotifications';
import { X, Trash2 } from 'lucide-react';

interface Props { onClose: () => void; }

export default function NotificationPanel({ onClose }: Props) {
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteNotif = useDeleteNotification();

  return (
    <div className="absolute right-0 top-10 w-80 bg-[#1a1d27] border border-[#2e3248] rounded-xl shadow-2xl z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e3248]">
        <span className="text-sm font-semibold text-white">Notifications</span>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button onClick={() => markAllRead.mutate()} className="text-xs text-[#6c63ff]">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-[#8b90a7] hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-center text-sm text-[#8b90a7] py-8">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b border-[#2e3248]">
              <div className="flex-1 min-w-0" onClick={() => !n.isRead && markRead.mutate(n.id)}>
                <p className="text-sm text-[#e8eaf0] cursor-pointer">{n.message}</p>
                <p className="text-xs text-[#8b90a7] mt-1">
                  {new Date(n.triggerDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => deleteNotif.mutate(n.id)} className="text-[#8b90a7] hover:text-red-400">
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
