import { Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useState } from 'react';
import NotificationPanel from '../notifications/NotificationPanel';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuthStore } from '../../store/auth.store';
import { useThemeStore } from '../../store/theme.store';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { isDark, toggle } = useThemeStore();
  const { data: notifications = [] } = useNotifications();
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-14 bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <span className="md:hidden font-bold text-[var(--text)] tracking-tight">JobTracker</span>
      <div className="hidden md:block" />
      <div className="flex items-center gap-2 md:gap-4">
        <span className="hidden md:block text-sm text-[var(--text-muted)]">{user?.name}</span>
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
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
        <button
          onClick={logout}
          className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-red-400 transition-colors"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
