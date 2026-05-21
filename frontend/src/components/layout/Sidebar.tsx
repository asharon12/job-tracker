import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Table2, Calendar, FileText, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', icon: Table2, label: 'Applications' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/resumes', icon: FileText, label: 'Resumes' },
];

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="w-56 shrink-0 bg-[#1a1d27] border-r border-[#2e3248] flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-[#2e3248]">
        <span className="text-white font-bold text-lg tracking-tight">JobTracker</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#6c63ff]/15 text-[#6c63ff]'
                  : 'text-[#8b90a7] hover:text-white hover:bg-[#21253a]'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-[#2e3248]">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#8b90a7] hover:text-red-400 hover:bg-[#21253a] transition-colors w-full"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
