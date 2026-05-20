'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { subscribeToReminders, subscribeToSteps, logMood, sendLoveTap } from '@/lib/db';
import { Heart, Footprints, Droplets, Apple, Activity } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import MoodCheckIn from '@/components/parent/MoodCheckIn';
import SOSButton from '@/components/shared/SOSButton';
import VirtualGarden from '@/components/parent/VirtualGarden';
import clsx from 'clsx';

export default function ParentDashboard() {
  const { user, profile } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [steps, setSteps] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [heartBeating, setHeartBeating] = useState(false);

  const familyId = profile?.familyId;

  useEffect(() => {
    if (!familyId) return;
    const unsubR = subscribeToReminders(familyId, setReminders);
    const unsubS = subscribeToSteps(familyId, setSteps);
    return () => { unsubR(); unsubS(); };
  }, [familyId]);

  const todayReminders = reminders.filter(r => {
    const today = new Date().toDateString();
    return r.scheduledTime && new Date(r.scheduledTime?.seconds * 1000).toDateString() === today;
  });

  const completedToday = todayReminders.filter(r => r.completed).length;
  const todaySteps = steps[0]?.steps || 0;

  const handleLoveTap = async () => {
    if (!familyId || !profile?.pairedWith) return;
    setHeartBeating(true);
    await sendLoveTap(familyId, user.uid, profile.pairedWith);
    toast('Sent love to your child! 💚', { icon: '🤍' });
    setTimeout(() => setHeartBeating(false), 1000);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-velira-900">
            {greeting()}, {profile?.displayName?.split(' ')[0]} 🌿
          </h1>
          <p className="font-body text-gray-500 mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <SOSButton familyId={familyId} userId={user?.uid} pairedWith={profile?.pairedWith} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-velira-600 mb-1">
            <Footprints size={16} />
            <span className="font-body text-xs text-gray-500">Steps today</span>
          </div>
          <p className="font-display text-3xl text-velira-900">{todaySteps.toLocaleString()}</p>
          <p className="font-body text-xs text-gray-400">Goal: 5,000</p>
          <div className="mt-2 bg-gray-100 rounded-full h-1.5">
            <div className="bg-velira-400 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.min((todaySteps / 5000) * 100, 100)}%` }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} className="text-velira-600" />
            <span className="font-body text-xs text-gray-500">Tasks done</span>
          </div>
          <p className="font-display text-3xl text-velira-900">{completedToday}/{todayReminders.length}</p>
          <p className="font-body text-xs text-gray-400">Today's reminders</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Heart size={16} className="text-red-400" />
            <span className="font-body text-xs text-gray-500">Mood</span>
          </div>
          <p className="font-display text-3xl text-velira-900">{todayMood || '—'}</p>
          <p className="font-body text-xs text-gray-400">How you feel today</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Mood check-in */}
          <MoodCheckIn familyId={familyId} userId={user?.uid} onMoodSet={setTodayMood} />

          {/* Today's reminders */}
          <div className="velira-card">
            <h2 className="font-display text-xl text-velira-900 mb-4">Today's reminders</h2>
            {todayReminders.length === 0 ? (
              <p className="font-body text-sm text-gray-400 text-center py-4">No reminders for today 🌿</p>
            ) : (
              <div className="space-y-3">
                {todayReminders.slice(0, 5).map(r => (
                  <div key={r.id} className={clsx('reminder-card', r.completed && 'opacity-50')}>
                    <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-base',
                      r.completed ? 'bg-velira-100' : 'bg-sand-100')}>
                      {r.type === 'medicine' ? '💊' : r.type === 'water' ? '💧' : r.type === 'walk' ? '🚶' : '🍽️'}
                    </div>
                    <div className="flex-1">
                      <p className={clsx('font-body text-sm font-medium',
                        r.completed ? 'line-through text-gray-400' : 'text-velira-900')}>{r.title}</p>
                      <p className="font-body text-xs text-gray-400">
                        {r.scheduledTime ? format(new Date(r.scheduledTime.seconds * 1000), 'h:mm a') : 'Anytime'}
                      </p>
                    </div>
                    {r.completed && <span className="text-velira-500 text-sm">✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Love button */}
          <div className="velira-card text-center">
            <h2 className="font-display text-xl text-velira-900 mb-2">Send love</h2>
            <p className="font-body text-sm text-gray-500 mb-4">Let your child know you're thinking of them</p>
            <button onClick={handleLoveTap}
              className={clsx('w-20 h-20 mx-auto rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center',
                'hover:bg-red-100 active:scale-95 transition-all duration-150',
                heartBeating && 'heart-beat')}>
              <Heart size={32} className="text-red-400" fill={heartBeating ? '#f87171' : 'none'} />
            </button>
            <p className="font-body text-xs text-gray-400 mt-3">Tap the heart 🤍</p>
          </div>

          {/* Virtual garden */}
          <VirtualGarden completedTasks={completedToday} totalTasks={todayReminders.length} />
        </div>
      </div>
    </div>
  );
}
