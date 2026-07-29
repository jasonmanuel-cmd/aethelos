'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiClient, setAuth } from '@/lib/api-client';

export default function LoginPage() {
  const [email, setEmail] = useState('jasonm@coaibakersfield.com');
  const [password, setPassword] = useState('blunts954');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post<any>('/tenant/login', { email, password });
      const data = res.data || res;
      setAuth(data.token, data.tenant?.id || data.tenant_id, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-aethelos-bg flex items-center justify-center relative overflow-hidden">
      {/* Warm ambient glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-aethelos-primary/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-aethelos-accent/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm mx-4"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aethelos-primary to-aethelos-secondary flex items-center justify-center text-white font-bold text-lg shadow-sm">A</div>
          <span className="font-display text-2xl font-bold">
            Aethel<span className="text-aethelos-primary">OS</span>
          </span>
        </div>

        <div className="card p-8">
          <h1 className="font-display text-xl font-bold text-aethelos-text mb-1">Welcome back</h1>
          <p className="text-aethelos-text-secondary text-sm mb-8">Sign in to your agency dashboard</p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-aethelos-accent/8 border border-aethelos-accent/15 text-aethelos-accent text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-aethelos-text-secondary uppercase tracking-wider mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@agency.com" className="w-full" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-aethelos-text-secondary uppercase tracking-wider mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full" required />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-aethelos-primary text-white font-medium hover:bg-aethelos-primary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-aethelos-muted">Demo credentials are pre-filled</p>
        </div>
      </motion.div>
    </div>
  );
}
