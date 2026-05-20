'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, Bell, Activity, Calendar, Brain, LogOut, Sprout } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/child/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/child/reminders', icon: Bell, label: 'Reminders' },
  { href: '/child/health', icon: Activity, label: 'Health' },
  { href: '/child/appointments', icon: Calendar, label: 'Appointments' },
  { href: '/child/insights', icon: Brain, label: 'AI Insights' },
];

export default function ChildLayout({ children }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  if (loading) return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center">
      <div className="flex items-center gap-2 text-velira-600 animate-pulse-soft">
        <Sprout size={24} />
        <span className="font-display text-xl">Loading Velira...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sand-50 flex">
      <aside className="w-64 bg-white border-r border-velira-100 flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-velira-100">
          <div className="flex items-center gap-2">
            <Sprout className="text-velira-600" size={22} />
            <span className="font-display text-xl text-velira-800">Velira</span>
          </div>
          <p className="font-body text-xs text-gray-400 mt-1">Child / caregiver view</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className={clsx('nav-link', pathname === href && 'active')}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-velira-100">
          <div className="px-4 py-3 mb-2">
            <p className="font-body text-sm font-medium text-velira-900">{profile?.displayName}</p>
            <p className="font-body text-xs text-gray-400">{profile?.email}</p>
          </div>
          <button onClick={signOut} className="nav-link w-full text-red-400 hover:text-red-600 hover:bg-red-50">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
