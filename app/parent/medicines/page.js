'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Pill, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Weekly', 'As needed'];

export default function MedicinesPage() {
  const { profile } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', dosage: '', frequency: 'Once daily', time: '', notes: '' });
  const familyId = profile?.familyId;

  const fetchMedicines = async () => {
    if (!familyId) return;
    const snap = await getDocs(collection(db, 'families', familyId, 'medicines'));
    setMedicines(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchMedicines(); }, [familyId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'families', familyId, 'medicines'), { ...form, createdAt: serverTimestamp() });
    toast.success('Medicine added to your cabinet! 💊');
    setForm({ name: '', dosage: '', frequency: 'Once daily', time: '', notes: '' });
    setShowAdd(false);
    fetchMedicines();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'families', familyId, 'medicines', id));
    toast.success('Removed');
    fetchMedicines();
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-velira-900">Medicine Cabinet</h1>
          <p className="font-body text-gray-500 mt-1">Your medications at a glance</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="velira-btn-primary flex items-center gap-2 py-2.5 px-5">
          <Plus size={16} /> Add medicine
        </button>
      </div>

      {showAdd && (
        <div className="velira-card mb-6 animate-slide-up">
          <h2 className="font-display text-xl text-velira-900 mb-4">Add medicine</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <input className="velira-input" placeholder="Medicine name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <input className="velira-input" placeholder="Dosage (e.g. 500mg)" value={form.dosage}
              onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} />
            <select className="velira-input" value={form.frequency}
              onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
              {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
            </select>
            <input className="velira-input" type="time" value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            <textarea className="velira-input" placeholder="Notes (optional)" rows={2}
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <div className="flex gap-3">
              <button type="submit" className="velira-btn-primary py-2.5 px-6">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="velira-btn-ghost py-2.5 px-6">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {medicines.length === 0 ? (
          <div className="velira-card text-center py-10">
            <Pill size={32} className="text-velira-300 mx-auto mb-3" />
            <p className="font-body text-gray-400">No medicines added yet</p>
          </div>
        ) : medicines.map(m => (
          <div key={m.id} className="velira-card flex items-start gap-4">
            <div className="w-10 h-10 bg-velira-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">💊</div>
            <div className="flex-1">
              <p className="font-body font-medium text-velira-900">{m.name}</p>
              <p className="font-body text-sm text-gray-500">{m.dosage} · {m.frequency}</p>
              {m.time && <p className="font-body text-xs text-velira-600 mt-0.5">⏰ {m.time}</p>}
              {m.notes && <p className="font-body text-xs text-gray-400 mt-1">{m.notes}</p>}
            </div>
            <button onClick={() => handleDelete(m.id)} className="text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
