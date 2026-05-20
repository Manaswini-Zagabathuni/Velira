'use client';
import { useState } from 'react';
import { logNotification } from '@/lib/db';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

export default function SOSButton({ familyId, userId, pairedWith }) {
  const [triggered, setTriggered] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleSOS = async () => {
    if (!confirm) { setConfirm(true); return; }
    setTriggered(true);

    // Get GPS location
    let location = null;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      });
    }

    // Log SOS notification
    if (familyId && pairedWith) {
      await logNotification(familyId, {
        type: 'sos',
        targetUid: pairedWith,
        message: '🚨 SOS Alert! Your parent needs help!',
        location,
        fromUid: userId,
      });
    }

    toast('🚨 SOS sent to your family! Help is on the way.', {
      duration: 5000,
      style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }
    });

    setTimeout(() => { setTriggered(false); setConfirm(false); }, 5000);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button onClick={handleSOS}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95
          ${confirm ? 'bg-red-600 sos-pulse' : 'bg-red-100 hover:bg-red-200 border-2 border-red-300'}`}>
        <AlertTriangle size={22} className={confirm ? 'text-white' : 'text-red-500'} />
      </button>
      <p className="font-body text-xs text-gray-400">{confirm ? 'Tap again!' : 'SOS'}</p>
    </div>
  );
}
