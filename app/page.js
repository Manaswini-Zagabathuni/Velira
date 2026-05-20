'use client';
import Link from 'next/link';
import { Heart, Shield, Bell, Sprout, Activity, Users } from 'lucide-react';

const features = [
  { icon: Bell, title: 'Smart Reminders', desc: 'Medicine, meals, water & walks — AI learns the perfect time for each' },
  { icon: Heart, title: 'Love Button', desc: 'One tap sends a warm notification — "Mom is thinking of you!"' },
  { icon: Activity, title: 'Health Tracking', desc: 'Steps, BP, sugar, sleep — all in one beautiful dashboard' },
  { icon: Sprout, title: 'Virtual Garden', desc: 'A garden that blooms as daily tasks are completed' },
  { icon: Shield, title: 'SOS Alert', desc: 'Emergency button instantly notifies family with GPS location' },
  { icon: Users, title: 'Family Connect', desc: 'Multiple siblings can all watch over parents together' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-sand-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Sprout className="text-velira-600" size={24} />
          <span className="font-display text-2xl text-velira-800 font-medium">Velira</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="velira-btn-ghost text-sm py-2 px-5">Sign in</Link>
          <Link href="/auth/signup" className="velira-btn-primary text-sm py-2 px-5">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-8 pt-16 pb-24 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-velira-100 text-velira-700 text-sm font-body px-4 py-2 rounded-full mb-8">
          <Heart size={14} fill="currentColor" />
          <span>Watching over your loved ones, always</span>
        </div>
        <h1 className="font-display text-6xl md:text-7xl text-velira-900 leading-tight mb-6">
          Care from a distance,<br />
          <em className="text-velira-600">love without limits</em>
        </h1>
        <p className="font-body text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Velira connects you with elderly parents through gentle reminders, health tracking,
          and real-time updates — so you can care for them no matter where you are.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signup" className="velira-btn-primary text-base py-4 px-8">
            Start watching over them
          </Link>
          <Link href="/auth/login" className="velira-btn-ghost text-base py-4 px-8">
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <h2 className="font-display text-4xl text-center text-velira-900 mb-12">
          Everything love needs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="velira-card hover:shadow-md transition-shadow duration-200 animate-slide-up">
              <div className="w-10 h-10 bg-velira-100 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-velira-600" />
              </div>
              <h3 className="font-display text-xl text-velira-900 mb-2">{title}</h3>
              <p className="font-body text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-velira-100 py-8 text-center">
        <p className="font-body text-sm text-gray-400">
          Made with <Heart size={12} className="inline text-red-400" fill="currentColor" /> for families everywhere · Velira 2025
        </p>
      </footer>
    </main>
  );
}
