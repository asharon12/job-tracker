import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-[#0f1117] border border-[#2e3248] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#8b90a7] focus:outline-none focus:border-[#6c63ff] transition-colors';

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">JobTracker</h1>
          <p className="text-[#8b90a7] text-sm mt-1">Sign in to your account</p>
        </div>
        <div className="bg-[#1a1d27] border border-[#2e3248] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8b90a7] mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className={inputCls} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b90a7] mb-1">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className={inputCls} placeholder="••••••••" />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-[#6c63ff] hover:bg-[#5b53ee] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-[#8b90a7] mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#6c63ff] hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
