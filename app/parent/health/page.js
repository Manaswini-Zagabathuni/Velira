'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { logHealthData, getHealthLogs, logSteps } from '@/lib/db';
import { Activity, Heart, Droplets, Footprints } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const LOG_TYPES = [
  { value: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg', icon: Heart, placeholder: '120/80', color: 'text-red-500' },
  { value: 'bloodSugar', label: 'Blood Sugar', unit: 'mg/dL', icon: Droplets, placeholder: '100', color: 'text-blue-500' },
  { value: 'heartRate', label: 'Heart Rate', unit: 'bpm', icon: Activity, placeholder: '72', color: 'text-pink-500' },
  { value: 'weight', label: 'Weight', unit: 'kg', icon: Activity, placeholder: '65', color: 'text-velira-500' },
];

export default function HealthLogPage() {
  const { user, profile } = useAuth();
  const [logs, setLogs] = useState({});
  const [steps, setSteps] = useState('');
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const familyId = profile?.familyId;

  useEffect(() => {
    if (!familyId) return;
    const fetchLogs = async () => {
      const results = {};
      for (const type of LOG_TYPES) {
        results[type.value] = await getHealthLogs(familyId, type.value, 5);
      }
      setLogs(results);
    };
    fetchLogs();
  }, [familyId]);

  const handleLogHealth = async (type) => {
    if (!values[type] || !familyId) return;
    setLoading(true);
    try {
      await logHealthData(familyId, user.uid, type, values[type]);
      toast.success('Health data logged! ✓');
      setValues(v => ({ ...v, [type]: '' }));
      // Refresh logs
      const newLogs = await getHealthLogs(familyId, type, 5);
      setLogs(l => ({ ...l, [type]: newLogs }));
    } catch {
      toast.error('Failed to log data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogSteps = async () => {
    if (!steps || !familyId) return;
    await logSteps(familyId, user.uid, parseInt(steps));
    toast.success('Steps logged! 🚶');
    setSteps('');
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-velira-900">Health Log</h1>
        <p className="font-body text-gray-500 mt-1">Track your vitals — your child can see these</p>
      </div>

      {/* Steps */}
      <div className="velira-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Footprints size={20} className="text-velira-600" />
          <h2 className="font-display text-xl text-velira-900">Steps Today</h2>
        </div>
        <div className="flex gap-3">
          <input className="velira-input flex-1" type="number" placeholder="How many steps did you walk?"
            value={steps} onChange={e => setSteps(e.target.value)} />
          <button onClick={handleLogSteps} className="velira-btn-primary px-5 py-2.5 whitespace-nowrap">Log steps</button>
        </div>
      </div>

      {/* Vitals */}
      <div className="grid grid-cols-2 gap-4">
        {LOG_TYPES.map(({ value, label, unit, icon: Icon, placeholder, color }) => (
          <div key={value} className="velira-card">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={18} className={color} />
              <h3 className="font-display text-lg text-velira-900">{label}</h3>
              <span className="font-body text-xs text-gray-400 ml-auto">{unit}</span>
            </div>
            <div className="flex gap-2 mb-4">
              <input className="velira-input flex-1" placeholder={placeholder}
                value={values[value] || ''}
                onChange={e => setValues(v => ({ ...v, [value]: e.target.value }))} />
              <button onClick={() => handleLogHealth(value)}
                className="bg-velira-600 text-white text-xs px-3 rounded-xl hover:bg-velira-700 active:scale-95 transition-all"
                disabled={loading}>Log</button>
            </div>
            {/* Recent logs */}
            <div className="space-y-1.5">
              {(logs[value] || []).slice(0, 3).map((log, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-body text-xs text-gray-400">
                    {log.loggedAt ? format(new Date(log.loggedAt.seconds * 1000), 'MMM d, h:mm a') : '—'}
                  </span>
                  <span className="font-body text-sm font-medium text-velira-800">{log.value} {unit}</span>
                </div>
              ))}
              {(!logs[value] || logs[value].length === 0) && (
                <p className="font-body text-xs text-gray-400 text-center py-1">No logs yet</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
