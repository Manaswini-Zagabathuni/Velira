'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { subscribeToReminders, completeReminder, addReminder } from '@/lib/db';
import { Bell, Plus, Check } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const REMINDER_TYPES = [
  { value: 'medicine', label: 'Medicine', emoji: '💊' },
  { value: 'water', label: 'Water', emoji: '💧' },
  { value: 'walk', label: 'Walk', emoji: '🚶' },
  { value: 'meal', label: 'Meal', emoji: '🍽️' },
  { value: 'sleep', label: 'Sleep', emoji: '😴' },
  { value: 'other', label: 'Other', emoji: '📌' },
];

export default function RemindersPage() {
  const { profile } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'medicine', scheduledTime: '' });
  const familyId = profile?.familyId;

  useEffect(() => {
    if (!familyId) return;
    return subscribeToReminders(familyId, setReminders);
  }, [familyId]);

  const handleComplete = async (reminderId) => {
    await completeReminder(familyId, reminderId);
    toast.success('Great job! Your child has been notified ✓');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await addReminder(familyId, {
      ...form,
      scheduledTime: form.scheduledTime ? new Date(form.scheduledTime) : null,
    });
    toast.success('Reminder added!');
    setForm({ title: '', type: 'medicine', scheduledTime: '' });
    setShowAdd(false);
  };

  const pending = reminders.filter(r => !r.completed);
  const completed = reminders.filter(r => r.completed);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-velira-900">Reminders</h1>
          <p className="font-body text-gray-500 mt-1">Your daily care checklist</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="velira-btn-primary flex items-center gap-2 py-2.5 px-5">
          <Plus size={16} /> Add reminder
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="velira-card mb-6 animate-slide-up">
          <h2 className="font-display text-xl text-velira-900 mb-4">New reminder</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="font-body text-xs font-medium text-velira-700 mb-1 block">Type</label>
              <div className="flex flex-wrap gap-2">
                {REMINDER_TYPES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => setForm(f => ({ ...f, type: t.value }))}
                    className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body border transition-all',
                      form.type === t.value ? 'border-velira-500 bg-velira-50 text-velira-700' : 'border-gray-200 text-gray-600 hover:border-velira-300')}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-body text-xs font-medium text-velira-700 mb-1 block">Title</label>
              <input className="velira-input" placeholder="e.g. Take blood pressure medicine"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <label className="font-body text-xs font-medium text-velira-700 mb-1 block">Scheduled time</label>
              <input className="velira-input" type="datetime-local"
                value={form.scheduledTime} onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="velira-btn-primary py-2.5 px-6">Save reminder</button>
              <button type="button" onClick={() => setShowAdd(false)} className="velira-btn-ghost py-2.5 px-6">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Pending */}
      <div className="mb-6">
        <h2 className="font-display text-xl text-velira-900 mb-3">Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="velira-card text-center py-8">
            <p className="text-3xl mb-2">🌟</p>
            <p className="font-body text-gray-500">All done for today!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(r => {
              const type = REMINDER_TYPES.find(t => t.value === r.type);
              return (
                <div key={r.id} className="reminder-card">
                  <span className="text-2xl">{type?.emoji || '📌'}</span>
                  <div className="flex-1">
                    <p className="font-body text-sm font-medium text-velira-900">{r.title}</p>
                    {r.scheduledTime && (
                      <p className="font-body text-xs text-gray-400">
                        {format(new Date(r.scheduledTime.seconds * 1000), 'h:mm a, MMM d')}
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleComplete(r.id)}
                    className="flex items-center gap-1.5 bg-velira-600 text-white text-xs font-body px-3 py-2 rounded-lg hover:bg-velira-700 active:scale-95 transition-all">
                    <Check size={14} /> Done
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-velira-900 mb-3">Completed ({completed.length})</h2>
          <div className="space-y-2">
            {completed.map(r => {
              const type = REMINDER_TYPES.find(t => t.value === r.type);
              return (
                <div key={r.id} className="reminder-card opacity-50">
                  <span className="text-xl">{type?.emoji || '📌'}</span>
                  <p className="font-body text-sm line-through text-gray-400 flex-1">{r.title}</p>
                  <span className="text-velira-500 text-sm">✓</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
