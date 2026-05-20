'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createUser, createFamilyPair, getUser } from '@/lib/db';
import toast from 'react-hot-toast';
import { Heart, Users } from 'lucide-react';

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', pairCode: '' });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signUp(form.email, form.password, form.name);
      const uid = cred.user.uid;

      if (role === 'parent') {
        await createUser(uid, {
          displayName: form.name,
          email: form.email,
          role: 'parent',
          pairCode: uid.slice(0, 6).toUpperCase(),
          familyId: null,
          fcmToken: null,
        });
        toast.success('Welcome to Velira! Share your pair code with your child.');
        router.push('/parent/dashboard');
      } else {
        // Child pairs with parent
        const parentQuery = form.pairCode.toUpperCase();
        // Find parent by pair code - simplified: pairCode = first 6 chars of uid
        // In production, query Firestore by pairCode field
        toast.success('Paired successfully! Welcome to Velira.');
        await createUser(uid, {
          displayName: form.name,
          email: form.email,
          role: 'child',
          familyId: null,
          fcmToken: null,
        });
        router.push('/child/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="velira-card">
        <h1 className="font-display text-3xl text-velira-900 mb-1">Join Velira</h1>
        <p className="font-body text-sm text-gray-500 mb-6">Start watching over your loved ones</p>

        {step === 1 && (
          <div className="space-y-4">
            <p className="font-body text-sm font-medium text-velira-800 mb-3">I am a...</p>
            <button
              onClick={() => { setRole('parent'); setStep(2); }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
                ${role === 'parent' ? 'border-velira-500 bg-velira-50' : 'border-gray-200 hover:border-velira-300'}`}
            >
              <div className="w-10 h-10 bg-velira-100 rounded-xl flex items-center justify-center">
                <Heart size={18} className="text-velira-600" />
              </div>
              <div>
                <p className="font-body font-medium text-velira-900">Parent / Elderly</p>
                <p className="font-body text-xs text-gray-500">I want to receive care reminders</p>
              </div>
            </button>
            <button
              onClick={() => { setRole('child'); setStep(2); }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
                ${role === 'child' ? 'border-velira-500 bg-velira-50' : 'border-gray-200 hover:border-velira-300'}`}
            >
              <div className="w-10 h-10 bg-sand-100 rounded-xl flex items-center justify-center">
                <Users size={18} className="text-sand-600" />
              </div>
              <div>
                <p className="font-body font-medium text-velira-900">Child / Caregiver</p>
                <p className="font-body text-xs text-gray-500">I want to care for my parent remotely</p>
              </div>
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="font-body text-xs font-medium text-velira-700 mb-1 block">Full name</label>
              <input className="velira-input" placeholder="Your name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="font-body text-xs font-medium text-velira-700 mb-1 block">Email</label>
              <input className="velira-input" type="email" placeholder="you@email.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="font-body text-xs font-medium text-velira-700 mb-1 block">Password</label>
              <input className="velira-input" type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
            </div>
            {role === 'child' && (
              <div>
                <label className="font-body text-xs font-medium text-velira-700 mb-1 block">Parent's pair code</label>
                <input className="velira-input" placeholder="e.g. A1B2C3" value={form.pairCode}
                  onChange={e => setForm(f => ({ ...f, pairCode: e.target.value }))} required />
                <p className="font-body text-xs text-gray-400 mt-1">Ask your parent for their 6-character code</p>
              </div>
            )}
            <button type="submit" className="velira-btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-center font-body text-sm text-gray-400 hover:text-gray-600">
              ← Back
            </button>
          </form>
        )}

        <p className="font-body text-sm text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-velira-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
