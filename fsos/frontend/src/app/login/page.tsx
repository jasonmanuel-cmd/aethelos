'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, setAuth } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, InputGroup, InputLabel } from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('jasonm@coaibakersfield.com');
  const [password, setPassword] = useState('blunts954');
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
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50 flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
      <div className="w-full max-w-md">
        <Card variant="elevated" padding="xl" className="border-2 border-stone-200">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              C
            </div>
            <CardTitle className="text-3xl font-bold text-stone-900">FSOS</CardTitle>
            <CardDescription className="text-lg text-stone-600">
              Financial Services Operating System
            </CardDescription>
            <p className="text-sm text-stone-500">by Chaotically Organized AI</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <InputGroup>
                <InputLabel htmlFor="email">Email</InputLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jasonm@coaibakersfield.com"
                  required
                />
              </InputGroup>

              <InputGroup>
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </InputGroup>

              <Button type="submit" size="xl" fullWidth isLoading={loading} className="mt-8">
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="pt-4 border-t border-stone-200">
              <p className="text-xs text-stone-500 text-center mb-2">
                Demo: jasonm@coaibakersfield.com / blunts954
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-stone-500">Backend: https://fsos-backend.vercel.app</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}