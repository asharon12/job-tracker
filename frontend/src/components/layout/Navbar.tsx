import { Bell } from 'lucide-react';
import { useState } from 'react';
import NotificationPanel from '../notifications/NotificationPanel';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuthStore } from '../../store/auth.store';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { data: notifications = [] } = useNotifications();
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-14 bg-[#1a1d27] border-b border-[#2e3248] flex items-center justify-between px-6 sticky top-0 z-10">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#8b90a7]">{user?.name}</span>
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative p-2 rounded-lg hover:bg-[#21253a] text-[#8b90a7] hover:text-white transition-colors"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#6c63ff] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {open && <NotificationPanel onClose={() => setOpen(false)} />}
        </div>
      </div>
    </header>
  );
}
