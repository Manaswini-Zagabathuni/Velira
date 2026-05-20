'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getHealthLogs, getStepsHistory } from '@/lib/db';
import { Activity, Heart, Droplets, Footprints } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const LOG_TYPES = [
  { value: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg', icon: Heart, color: '#ef4444' },
  { value: 'bloodSugar', label: 'Blood Sugar', unit: 'mg/dL', icon: Droplets, color: '#3b82f6' },
  { value: 'heartRate', label: 'Heart Rate', unit: 'bpm', icon: Activity, color: '#ec4899' },
  { value: 'weight', label: 'Weight', unit: 'kg', icon: Activity, color: '#2a9669' },
];

export default function ChildHealthPage() {
  const { profile } = useAuth();
  const [logs, setLogs] = useState({});
  const [steps, setSteps] = useState([]);
  const familyId = profile?.familyId;

  useEffect(() => {
    if (!familyId) return;
    const fetchData = async () => {
      const stepsData = await getStepsHistory(familyId, 7);
      setSteps([...stepsData].reverse());
      const results = {};
      for (const type of LOG_TYPES) {
        results[type.value] = await getHealthLogs(familyId, type.value, 7);
      }
      setLogs(results);
    };
    fetchData();
  }, [familyId]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-velira-900">Health Overview</h1>
        <p className="font-body text-gray-500 mt-1">Your parent's health at a glance</p>
      </div>

      {/* Steps chart */}
      <div className="velira-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Footprints size={18} className="text-velira-600" />
          <h2 className="font-display text-xl text-velira-900">Daily Steps</h2>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={steps.map(s => ({ date: s.date?.slice(5), steps: s.steps }))}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
            <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderRadius: 8 }} />
            <Line type="monotone" dataKey="steps" stroke="#2a9669" strokeWidth={2} dot={{ fill: '#2a9669', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {LOG_TYPES.map(({ value, label, unit, icon: Icon, color }) => (
          <div key={value} className="velira-card">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} style={{ color }} />
              <h3 className="font-display text-lg text-velira-900">{label}</h3>
            </div>
            {(logs[value] || []).length === 0 ? (
              <p className="font-body text-xs text-gray-400 py-2">No data logged yet</p>
            ) : (
              <div className="space-y-2">
                {(logs[value] || []).slice(0, 4).map((log, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="font-body text-xs text-gray-400">
                      {log.loggedAt ? new Date(log.loggedAt.seconds * 1000).toLocaleDateString() : '—'}
                    </span>
                    <span className="font-body text-sm font-medium" style={{ color }}>{log.value} {unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
