'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  subscribeToReminders, subscribeToSteps, subscribeToLoveTaps,
  subscribeToNotifications, getUser, sendLoveTap, addReminder
} from '@/lib/db';
import { Heart, Plus, Footprints, Activity, Bell } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

export default function ChildDashboard() {
  const { user, profile } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [steps, setSteps] = useState([]);
  const [parent, setParent] = useState(null);
  const [loveTap, setLoveTap] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [heartAnim, setHeartAnim] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: '', type: 'medicine', scheduledTime: '' });

  const familyId = profile?.familyId;

  useEffect(() => {
    if (!familyId || !profile?.pairedWith) return;
    getUser(profile.pairedWith).then(setParent);
    const unsubR = subscribeToReminders(familyId, setReminders);
    const unsubS = subscribeToSteps(familyId, setSteps);
    const unsubL = subscribeToLoveTaps(familyId, user.uid, (tap) => {
      setLoveTap(tap);
      setHeartAnim(true);
      toast('Your parent is thinking of you! 🤍', { icon: '💚' });
      setTimeout(() => setHeartAnim(false), 1200);
    });
    const unsubN = subscribeToNotifications(familyId, user.uid, setNotifications);
    return () => { unsubR(); unsubS(); unsubL(); unsubN(); };
  }, [familyId, profile]);

  const pending = reminders.filter(r => !r.completed);
  const completed = reminders.filter(r => r.completed);
  const stepsData = [...steps].reverse().map(s => ({ date: s.date?.slice(5), steps: s.steps }));
  const todaySteps = steps[0]?.steps || 0;

  const handleSendLove = async () => {
    if (!familyId || !profile?.pairedWith) return;
    setHeartAnim(true);
    await sendLoveTap(familyId, user.uid, profile.pairedWith);
    toast('Sent love to your parent! 💚');
    setTimeout(() => setHeartAnim(false), 1000);
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!familyId) return;
    await addReminder(familyId, {
      ...newReminder,
      scheduledTime: newReminder.scheduledTime ? new Date(newReminder.scheduledTime) : null,
      setBy: 'child',
    });
    toast.success('Reminder added for your parent!');
    setNewReminder({ title: '', type: 'medicine', scheduledTime: '' });
    setShowAddReminder(false);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-velira-900">
            Watching over {parent?.displayName?.split(' ')[0] || 'your parent'} 🌿
          </h1>
          <p className="font-body text-gray-500 mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Love button */}
          <div className="flex flex-col items-center gap-1">
            <button onClick={handleSendLove}
              className={clsx('w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center',
                'hover:bg-red-100 active:scale-95 transition-all', heartAnim && 'heart-beat')}>
              <Heart size={22} className="text-red-400" fill={heartAnim ? '#f87171' : 'none'} />
            </button>
            <p className="font-body text-xs text-gray-400">Send love</p>
          </div>
          <button onClick={() => setShowAddReminder(!showAddReminder)}
            className="velira-btn-primary flex items-center gap-2 py-2.5 px-5">
            <Plus size={16} /> Add reminder
          </button>
        </div>
      </div>

      {/* Love tap banner */}
      {loveTap && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 mb-6 flex items-center gap-3 animate-bloom">
          <Heart size={18} className="text-red-400" fill="#f87171" />
          <p className="font-body text-sm text-red-700">
            {parent?.displayName?.split(' ')[0] || 'Your parent'} sent you love just now 🤍
          </p>
        </div>
      )}

      {/* Add reminder form */}
      {showAddReminder && (
        <div className="velira-card mb-6 animate-slide-up">
          <h2 className="font-display text-xl text-velira-900 mb-4">Add reminder for {parent?.displayName?.split(' ')[0]}</h2>
          <form onSubmit={handleAddReminder} className="space-y-3">
            <input className="velira-input" placeholder="Reminder title (e.g. Take evening medicine)"
              value={newReminder.title} onChange={e => setNewReminder(r => ({ ...r, title: e.target.value }))} required />
            <select className="velira-input" value={newReminder.type}
              onChange={e => setNewReminder(r => ({ ...r, type: e.target.value }))}>
              <option value="medicine">💊 Medicine</option>
              <option value="water">💧 Water</option>
              <option value="walk">🚶 Walk</option>
              <option value="meal">🍽️ Meal</option>
              <option value="sleep">😴 Sleep</option>
            </select>
            <input className="velira-input" type="datetime-local"
              value={newReminder.scheduledTime} onChange={e => setNewReminder(r => ({ ...r, scheduledTime: e.target.value }))} />
            <div className="flex gap-3">
              <button type="submit" className="velira-btn-primary py-2.5 px-6">Add reminder</button>
              <button type="button" onClick={() => setShowAddReminder(false)} className="velira-btn-ghost py-2.5 px-6">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-velira-600 mb-1">
            <Footprints size={16} />
            <span className="font-body text-xs text-gray-500">Steps today</span>
          </div>
          <p className="font-display text-3xl text-velira-900">{todaySteps.toLocaleString()}</p>
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
          <p className="font-display text-3xl text-velira-900">{completed.length}/{reminders.length}</p>
          <p className="font-body text-xs text-gray-400">Today's reminders</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Bell size={16} className="text-velira-600" />
            <span className="font-body text-xs text-gray-500">Pending</span>
          </div>
          <p className="font-display text-3xl text-velira-900">{pending.length}</p>
          <p className="font-body text-xs text-gray-400">Reminders left</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Steps chart */}
        <div className="velira-card">
          <h2 className="font-display text-xl text-velira-900 mb-4">Steps this week</h2>
          {stepsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={stepsData}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
                <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderRadius: 8, border: '1px solid #b4e6ce' }} />
                <Line type="monotone" dataKey="steps" stroke="#2a9669" strokeWidth={2} dot={{ fill: '#2a9669', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="font-body text-sm text-gray-400">No step data yet 🚶</p>
            </div>
          )}
        </div>

        {/* Reminders status */}
        <div className="velira-card">
          <h2 className="font-display text-xl text-velira-900 mb-4">Reminder status</h2>
          <div className="space-y-2">
            {reminders.slice(0, 5).map(r => (
              <div key={r.id} className={clsx('flex items-center gap-3 p-2 rounded-xl',
                r.completed ? 'bg-velira-50' : 'bg-gray-50')}>
                <span className="text-lg">
                  {r.type === 'medicine' ? '💊' : r.type === 'water' ? '💧' : r.type === 'walk' ? '🚶' : '🍽️'}
                </span>
                <p className={clsx('font-body text-sm flex-1',
                  r.completed ? 'text-velira-700' : 'text-gray-600')}>{r.title}</p>
                <span className={clsx('font-body text-xs px-2 py-0.5 rounded-full',
                  r.completed ? 'bg-velira-200 text-velira-800' : 'bg-gray-200 text-gray-600')}>
                  {r.completed ? '✓ Done' : 'Pending'}
                </span>
              </div>
            ))}
            {reminders.length === 0 && (
              <p className="font-body text-sm text-gray-400 text-center py-4">No reminders yet. Add one! ↗</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
