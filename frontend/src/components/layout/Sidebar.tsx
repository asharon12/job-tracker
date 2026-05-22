import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Table2, Calendar, Bell, FileText, LogOut, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useNotifications } from '../../hooks/useNotifications';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', icon: Table2, label: 'Applications' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
];

const linkCls = 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]';

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <aside className="hidden md:flex w-56 shrink-0 bg-[var(--bg-surface)] border-r border-[var(--border)] flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-[var(--border)]">
        <span className="text-[var(--text)] font-bold text-lg tracking-tight">JobTracker</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-[#6c63ff]/15 text-[#6c63ff]' : linkCls
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-[#6c63ff]/15 text-[#6c63ff]' : linkCls
            }`
          }
        >
          <Bell size={16} />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto bg-[#6c63ff] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>

        <a
          href="https://resume-builder-beta-nine-86.vercel.app/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${linkCls}`}
        >
          <FileText size={16} />
          Build Resume
          <ExternalLink size={12} className="ml-auto opacity-60" />
        </a>
      </nav>
      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--bg-elevated)] transition-colors w-full"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
