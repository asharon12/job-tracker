import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Table2, Calendar, Bell, FileText } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', icon: Table2, label: 'Apps' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
];

const RESUME_URL = 'https://resume-builder-beta-nine-86.vercel.app/dashboard';

export default function BottomNav() {
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)] border-t border-[var(--border)] flex items-center">
      {nav.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#6c63ff]' : 'text-[var(--text-muted)]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {to === '/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 bg-[#6c63ff] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
      <a
        href={RESUME_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium text-[var(--text-muted)]"
      >
        <FileText size={20} strokeWidth={2} />
        <span>Resume</span>
      </a>
    </nav>
  );
}
