'use client';
import { useState } from 'react';
import { logMood } from '@/lib/db';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const MOODS = [
  { emoji: '😄', label: 'Great', value: 'great', color: 'bg-yellow-50 border-yellow-300' },
  { emoji: '🙂', label: 'Good', value: 'good', color: 'bg-green-50 border-green-300' },
  { emoji: '😐', label: 'Okay', value: 'okay', color: 'bg-blue-50 border-blue-300' },
  { emoji: '😔', label: 'Low', value: 'low', color: 'bg-purple-50 border-purple-300' },
  { emoji: '😞', label: 'Sad', value: 'sad', color: 'bg-red-50 border-red-300' },
];

export default function MoodCheckIn({ familyId, userId, onMoodSet }) {
  const [selected, setSelected] = useState(null);
  const [logged, setLogged] = useState(false);

  const handleMood = async (mood) => {
    setSelected(mood.value);
    if (!familyId) return;
    await logMood(familyId, userId, mood.value);
    onMoodSet?.(mood.emoji);
    setLogged(true);
    toast.success(`Mood logged: ${mood.emoji} ${mood.label}`);
  };

  return (
    <div className="velira-card">
      <h2 className="font-display text-xl text-velira-900 mb-1">How are you feeling?</h2>
      <p className="font-body text-xs text-gray-400 mb-4">Check in once a day</p>

      {logged ? (
        <div className="text-center py-3">
          <p className="text-3xl mb-1">{MOODS.find(m => m.value === selected)?.emoji}</p>
          <p className="font-body text-sm text-velira-700 font-medium">
            Feeling {MOODS.find(m => m.value === selected)?.label} today
          </p>
          <p className="font-body text-xs text-gray-400 mt-1">Your child has been notified 💚</p>
        </div>
      ) : (
        <div className="flex gap-2">
          {MOODS.map(mood => (
            <button key={mood.value} onClick={() => handleMood(mood)}
              className={clsx('mood-chip flex-1', selected === mood.value && 'selected',
                selected === mood.value && mood.color)}>
              <span className="text-2xl">{mood.emoji}</span>
              <span className="font-body text-xs text-gray-500">{mood.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
