import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Component, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from './store/auth.store';
import { useThemeStore, applyTheme } from './store/theme.store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import CalendarPage from './pages/CalendarPage';
import ResumesPage from './pages/ResumesPage';
import NotificationsPage from './pages/NotificationsPage';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';

const qc = new QueryClient();

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, color: '#ff6b6b', background: '#0f1117', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#fff' }}>Runtime Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedLayout() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const token = useAuthStore((s) => s.token);
  const isDark = useThemeStore((s) => s.isDark);
  useEffect(() => { applyTheme(isDark); }, [isDark]);
  return (
    <ErrorBoundary>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/resumes" element={<ResumesPage />} />
            </Route>
            <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
