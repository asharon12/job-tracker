import { Bell, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkRead, useMarkAllRead, useDeleteNotification } from '../hooks/useNotifications';
import { fmtDateTime } from '../lib/dates';

const typeStyles: Record<string, { dot: string; label: string }> = {
  FOLLOW_UP:                  { dot: 'bg-[#6c63ff]',  label: 'Interview' },
  AWAITING_REFERRAL_REMINDER: { dot: 'bg-orange-400', label: 'Referral' },
};

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteNotif = useDeleteNotification();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="flex items-center gap-1.5 text-xs text-[#6c63ff] hover:text-[#8b7fff] transition-colors"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        {isLoading ? (
          <p className="text-center text-sm text-[var(--text-muted)] py-12">Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Bell size={32} className="text-[var(--text-muted)] opacity-40" />
            <p className="text-sm text-[var(--text-muted)]">No notifications</p>
          </div>
        ) : (
          notifications.map((n) => {
            const style = typeStyles[n.type] ?? { dot: 'bg-gray-400', label: n.type };
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 border-b border-[var(--border)] last:border-0 transition-colors ${
                  !n.isRead ? 'bg-[#6c63ff]/5' : ''
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${style.dot} ${n.isRead ? 'opacity-30' : ''}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-[var(--text-muted)]">{style.label}</span>
                    {n.application && (
                      <span className="text-xs text-[var(--text-muted)]">· {n.application.companyName}</span>
                    )}
                  </div>
                  <p className={`text-sm ${n.isRead ? 'text-[var(--text-muted)]' : 'text-[var(--text)]'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{fmtDateTime(n.triggerDate)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markRead.mutate(n.id)}
                      className="text-xs text-[#6c63ff] hover:text-[#8b7fff] transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif.mutate(n.id)}
                    className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
