'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getStepsHistory, getMoodHistory, getReminders } from '@/lib/db';
import { Brain, Loader, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InsightsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState('');
  const familyId = profile?.familyId;

  const generateInsight = async () => {
    if (!familyId) { toast.error('No family connected yet'); return; }
    setLoading(true);
    try {
      const [steps, moods, reminders] = await Promise.all([
        getStepsHistory(familyId, 7),
        getMoodHistory(familyId, 7),
        getReminders(familyId),
      ]);
      const completed = reminders.filter(r => r.completed).length;
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are a caring health assistant for a family care app called Velira.
Analyse this elderly parent's weekly data and give a warm, helpful summary to their child.

Steps (last 7 days): ${JSON.stringify(steps.map(s => ({ date: s.date, steps: s.steps })))}
Moods: ${JSON.stringify(moods.map(m => ({ date: m.date, mood: m.mood })))}
Reminders completed: ${completed} out of ${reminders.length}

Write 3-4 warm sentences. Note any concerning patterns. End with one gentle suggestion. Be caring, not clinical.`
        }),
      });
      const data = await res.json();
      setInsight(data.insight);
    } catch { toast.error('Could not generate insight'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-velira-900">AI Insights</h1>
        <p className="font-body text-gray-500 mt-1">Powered by Claude — your caring AI assistant</p>
      </div>
      <div className="velira-card mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-velira-100 rounded-xl flex items-center justify-center">
            <Brain size={20} className="text-velira-600" />
          </div>
          <div>
            <h2 className="font-display text-xl text-velira-900">Weekly Health Analysis</h2>
            <p className="font-body text-xs text-gray-400">Analyses steps, mood & reminder patterns</p>
          </div>
        </div>
        {insight ? (
          <div className="bg-velira-50 border border-velira-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-velira-600" />
              <span className="font-body text-xs font-medium text-velira-700">AI Analysis</span>
            </div>
            <p className="font-body text-sm text-velira-800 leading-relaxed">{insight}</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center mb-4">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-body text-sm text-gray-400">Click below to analyse your parent's health patterns</p>
          </div>
        )}
        <button onClick={generateInsight} disabled={loading}
          className="velira-btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <><Loader size={16} className="animate-spin" />Analysing...</> : '✨ Generate AI Insight'}
        </button>
      </div>
      <div className="velira-card bg-amber-50 border-amber-200">
        <p className="font-body text-xs text-amber-700 leading-relaxed">
          💡 <strong>How it works:</strong> Velira reads your parent's step count, daily mood, and reminder completion — then gives you a personalised summary with gentle suggestions.
        </p>
      </div>
    </div>
  );
}
