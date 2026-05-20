'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { subscribeToReminders } from '@/lib/db';
import VirtualGarden from '@/components/parent/VirtualGarden';

export default function GardenPage() {
  const { profile } = useAuth();
  const [reminders, setReminders] = useState([]);
  const familyId = profile?.familyId;

  useEffect(() => {
    if (!familyId) return;
    return subscribeToReminders(familyId, setReminders);
  }, [familyId]);

  const todayReminders = reminders.filter(r => {
    const today = new Date().toDateString();
    return r.scheduledTime && new Date(r.scheduledTime?.seconds * 1000).toDateString() === today;
  });

  const completed = todayReminders.filter(r => r.completed).length;

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-velira-900">My Garden</h1>
        <p className="font-body text-gray-500 mt-1">Your garden grows as you complete daily tasks 🌱</p>
      </div>

      <VirtualGarden completedTasks={completed} totalTasks={todayReminders.length} />

      <div className="velira-card mt-6">
        <h2 className="font-display text-xl text-velira-900 mb-3">How it works</h2>
        <div className="space-y-2">
          {[
            { stage: '🌰 Seed', desc: 'No tasks completed yet' },
            { stage: '🌱 Sprout', desc: 'Complete 1-2 tasks' },
            { stage: '🌿 Growing', desc: 'Halfway through your tasks' },
            { stage: '🌸 Blooming', desc: 'Almost all tasks done' },
            { stage: '🌺 Flourishing', desc: 'All tasks completed!' },
          ].map(({ stage, desc }) => (
            <div key={stage} className="flex items-center gap-3 font-body text-sm">
              <span className="w-32 font-medium text-velira-800">{stage}</span>
              <span className="text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
