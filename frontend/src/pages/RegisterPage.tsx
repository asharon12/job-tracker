import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#6c63ff] transition-colors';

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--text)]">JobTracker</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Create your account</p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} placeholder="Your Name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className={inputCls} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required className={inputCls} placeholder="Min 6 characters" />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-[#6c63ff] hover:bg-[#5b53ee] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-[#6c63ff] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
