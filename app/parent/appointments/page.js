'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { addAppointment, getAppointments, deleteAppointment } from '@/lib/db';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AppointmentsPage() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', doctor: '', date: '', notes: '' });
  const familyId = profile?.familyId;

  const fetchAppointments = async () => {
    if (!familyId) return;
    const data = await getAppointments(familyId);
    setAppointments(data);
  };

  useEffect(() => { fetchAppointments(); }, [familyId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addAppointment(familyId, form);
    toast.success('Appointment added!');
    setForm({ title: '', doctor: '', date: '', notes: '' });
    setShowAdd(false);
    fetchAppointments();
  };

  const handleDelete = async (id) => {
    await deleteAppointment(familyId, id);
    toast.success('Appointment removed');
    fetchAppointments();
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-velira-900">Appointments</h1>
          <p className="font-body text-gray-500 mt-1">Track your doctor visits</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="velira-btn-primary flex items-center gap-2 py-2.5 px-5">
          <Plus size={16} /> Add
        </button>
      </div>

      {showAdd && (
        <div className="velira-card mb-6 animate-slide-up">
          <h2 className="font-display text-xl text-velira-900 mb-4">New appointment</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <input className="velira-input" placeholder="Appointment title" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <input className="velira-input" placeholder="Doctor / Hospital name" value={form.doctor}
              onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} />
            <input className="velira-input" type="datetime-local" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            <textarea className="velira-input" placeholder="Notes (optional)" value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            <div className="flex gap-3">
              <button type="submit" className="velira-btn-primary py-2.5 px-6">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="velira-btn-ghost py-2.5 px-6">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="velira-card text-center py-10">
            <Calendar size={32} className="text-velira-300 mx-auto mb-3" />
            <p className="font-body text-gray-400">No appointments yet</p>
          </div>
        ) : appointments.map(a => (
          <div key={a.id} className="velira-card flex items-start gap-4">
            <div className="w-10 h-10 bg-velira-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-velira-600" />
            </div>
            <div className="flex-1">
              <p className="font-body font-medium text-velira-900">{a.title}</p>
              {a.doctor && <p className="font-body text-sm text-gray-500">{a.doctor}</p>}
              {a.date && <p className="font-body text-xs text-velira-600 mt-1">
                {format(new Date(a.date), 'EEEE, MMM d · h:mm a')}
              </p>}
              {a.notes && <p className="font-body text-xs text-gray-400 mt-1">{a.notes}</p>}
            </div>
            <button onClick={() => handleDelete(a.id)} className="text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
