'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getUser } from '@/lib/db';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signIn(form.email, form.password);
      const profile = await getUser(cred.user.uid);
      toast.success(`Welcome back, ${profile?.displayName || 'there'}! 🌿`);
      if (profile?.role === 'parent') router.push('/parent/dashboard');
      else router.push('/child/dashboard');
    } catch (err) {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="velira-card">
        <h1 className="font-display text-3xl text-velira-900 mb-1">Welcome back</h1>
        <p className="font-body text-sm text-gray-500 mb-6">Sign in to Velira</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-body text-xs font-medium text-velira-700 mb-1 block">Email</label>
            <input className="velira-input" type="email" placeholder="you@email.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="font-body text-xs font-medium text-velira-700 mb-1 block">Password</label>
            <input className="velira-input" type="password" placeholder="Your password"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="velira-btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="font-body text-sm text-center text-gray-400 mt-6">
          New to Velira?{' '}
          <Link href="/auth/signup" className="text-velira-600 hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}
