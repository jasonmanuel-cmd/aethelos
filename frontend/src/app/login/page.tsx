'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, setAuth } from '@/lib/api-client';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res: any = await apiClient.post('/tenant/login', { email, password });
      setAuth(res.data.token, res.data.tenant.id, res.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fsos-500 to-brand-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              C
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">FSOS</h1>
            <p className="text-sm text-gray-500 mt-1">Financial Services Operating System</p>
            <p className="text-xs text-gray-400 mt-1">by Chaotically Organized AI</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@agency.com"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Demo: admin@demo.com / admin123
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-fsos-900 via-gray-900 to-brand-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative text-center max-w-lg">
          <h2 className="text-4xl font-bold text-white font-display mb-4">
            Welcome to FSOS
          </h2>
          <p className="text-lg text-gray-300">
            The AI-native operating system for financial professionals.
            Track leads, automate outreach, manage policies, and grow your book of business.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            {[
              ['🤖', 'AI Lead Qualification'],
              ['📅', 'Smart Scheduling'],
              ['📊', 'Pipeline Analytics'],
              ['⚡', 'Automated Workflows'],
            ].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                <span className="text-xl">{icon}</span>
                <span className="text-sm text-gray-200">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
