'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { subscribeToReminders, addReminder } from '@/lib/db';
import { Bell, Plus } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const TYPES = [
  { value: 'medicine', emoji: '💊' }, { value: 'water', emoji: '💧' },
  { value: 'walk', emoji: '🚶' }, { value: 'meal', emoji: '🍽️' },
];

export default function ChildRemindersPage() {
  const { profile } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'medicine', scheduledTime: '' });
  const familyId = profile?.familyId;

  useEffect(() => {
    if (!familyId) return;
    return subscribeToReminders(familyId, setReminders);
  }, [familyId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addReminder(familyId, {
      ...form,
      scheduledTime: form.scheduledTime ? new Date(form.scheduledTime) : null,
      setBy: 'child',
    });
    toast.success('Reminder set for your parent!');
    setForm({ title: '', type: 'medicine', scheduledTime: '' });
    setShowAdd(false);
  };

  const getEmoji = (type) => TYPES.find(t => t.value === type)?.emoji || '📌';

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-velira-900">Reminders</h1>
          <p className="font-body text-gray-500 mt-1">Set & monitor your parent's reminders</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="velira-btn-primary flex items-center gap-2 py-2.5 px-5">
          <Plus size={16} /> Add reminder
        </button>
      </div>

      {showAdd && (
        <div className="velira-card mb-6 animate-slide-up">
          <form onSubmit={handleAdd} className="space-y-3">
            <select className="velira-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.value}</option>)}
            </select>
            <input className="velira-input" placeholder="Reminder title" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <input className="velira-input" type="datetime-local" value={form.scheduledTime}
              onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))} />
            <div className="flex gap-3">
              <button type="submit" className="velira-btn-primary py-2.5 px-6">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="velira-btn-ghost py-2.5 px-6">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="velira-card text-center py-10">
            <Bell size={32} className="text-velira-300 mx-auto mb-3" />
            <p className="font-body text-gray-400">No reminders yet</p>
          </div>
        ) : reminders.map(r => (
          <div key={r.id} className={clsx('reminder-card', r.completed && 'opacity-60')}>
            <span className="text-2xl">{getEmoji(r.type)}</span>
            <div className="flex-1">
              <p className={clsx('font-body text-sm font-medium', r.completed ? 'line-through text-gray-400' : 'text-velira-900')}>{r.title}</p>
              {r.scheduledTime && (
                <p className="font-body text-xs text-gray-400">
                  {format(new Date(r.scheduledTime.seconds * 1000), 'MMM d, h:mm a')}
                </p>
              )}
              {r.setBy === 'child' && <span className="font-body text-xs text-velira-500">Set by you</span>}
            </div>
            <span className={clsx('font-body text-xs px-2 py-1 rounded-full',
              r.completed ? 'bg-velira-100 text-velira-700' : 'bg-gray-100 text-gray-500')}>
              {r.completed ? '✓ Done' : 'Pending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
