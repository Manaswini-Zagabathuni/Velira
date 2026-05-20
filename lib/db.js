import { db } from './firebase';
import {
  collection, doc, setDoc, getDoc, getDocs,
  updateDoc, addDoc, query, where, orderBy,
  limit, onSnapshot, serverTimestamp, deleteDoc,
} from 'firebase/firestore';

// ─── Users ───────────────────────────────────────────────
export const createUser = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUser = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
};

// ─── Family Pairing ──────────────────────────────────────
export const createFamilyPair = async (parentUid, childUid) => {
  const pairId = [parentUid, childUid].sort().join('_');
  await setDoc(doc(db, 'families', pairId), {
    parentUid,
    childUid,
    createdAt: serverTimestamp(),
    active: true,
  });
  await updateUser(parentUid, { familyId: pairId, role: 'parent', pairedWith: childUid });
  await updateUser(childUid, { familyId: pairId, role: 'child', pairedWith: parentUid });
  return pairId;
};

export const getFamilyPair = async (familyId) => {
  const snap = await getDoc(doc(db, 'families', familyId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ─── Reminders ───────────────────────────────────────────
export const addReminder = async (familyId, reminder) => {
  return await addDoc(collection(db, 'families', familyId, 'reminders'), {
    ...reminder,
    completed: false,
    createdAt: serverTimestamp(),
  });
};

export const getReminders = async (familyId) => {
  const q = query(
    collection(db, 'families', familyId, 'reminders'),
    orderBy('scheduledTime', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const completeReminder = async (familyId, reminderId) => {
  await updateDoc(doc(db, 'families', familyId, 'reminders', reminderId), {
    completed: true,
    completedAt: serverTimestamp(),
  });
};

export const subscribeToReminders = (familyId, callback) => {
  const q = query(
    collection(db, 'families', familyId, 'reminders'),
    orderBy('scheduledTime', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// ─── Steps ───────────────────────────────────────────────
export const logSteps = async (familyId, parentUid, steps, date) => {
  const dateKey = date || new Date().toISOString().split('T')[0];
  await setDoc(doc(db, 'families', familyId, 'steps', dateKey), {
    steps,
    parentUid,
    date: dateKey,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getStepsHistory = async (familyId, days = 7) => {
  const snap = await getDocs(
    query(collection(db, 'families', familyId, 'steps'), orderBy('date', 'desc'), limit(days))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const subscribeToSteps = (familyId, callback) => {
  return onSnapshot(
    query(collection(db, 'families', familyId, 'steps'), orderBy('date', 'desc'), limit(7)),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
};

// ─── Mood ─────────────────────────────────────────────────
export const logMood = async (familyId, parentUid, mood) => {
  const dateKey = new Date().toISOString().split('T')[0];
  await setDoc(doc(db, 'families', familyId, 'moods', dateKey), {
    mood,
    parentUid,
    date: dateKey,
    loggedAt: serverTimestamp(),
  });
};

export const getMoodHistory = async (familyId, days = 14) => {
  const snap = await getDocs(
    query(collection(db, 'families', familyId, 'moods'), orderBy('date', 'desc'), limit(days))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── Health Logs ─────────────────────────────────────────
export const logHealthData = async (familyId, parentUid, type, value) => {
  await addDoc(collection(db, 'families', familyId, 'healthLogs'), {
    type,
    value,
    parentUid,
    loggedAt: serverTimestamp(),
  });
};

export const getHealthLogs = async (familyId, type, limitCount = 10) => {
  const q = query(
    collection(db, 'families', familyId, 'healthLogs'),
    where('type', '==', type),
    orderBy('loggedAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── Notifications Log ───────────────────────────────────
export const logNotification = async (familyId, data) => {
  await addDoc(collection(db, 'families', familyId, 'notifications'), {
    ...data,
    sentAt: serverTimestamp(),
    read: false,
  });
};

export const subscribeToNotifications = (familyId, uid, callback) => {
  const q = query(
    collection(db, 'families', familyId, 'notifications'),
    where('targetUid', '==', uid),
    orderBy('sentAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// ─── Love Taps ───────────────────────────────────────────
export const sendLoveTap = async (familyId, fromUid, toUid) => {
  await addDoc(collection(db, 'families', familyId, 'loveTaps'), {
    fromUid,
    toUid,
    sentAt: serverTimestamp(),
  });
};

export const subscribeToLoveTaps = (familyId, toUid, callback) => {
  const q = query(
    collection(db, 'families', familyId, 'loveTaps'),
    where('toUid', '==', toUid),
    orderBy('sentAt', 'desc'),
    limit(1)
  );
  return onSnapshot(q, (snap) => {
    if (!snap.empty) callback(snap.docs[0].data());
  });
};

// ─── Appointments ────────────────────────────────────────
export const addAppointment = async (familyId, appointment) => {
  return await addDoc(collection(db, 'families', familyId, 'appointments'), {
    ...appointment,
    createdAt: serverTimestamp(),
  });
}; 

export const getAppointments = async (familyId) => {
  const snap = await getDocs(
    query(collection(db, 'families', familyId, 'appointments'), orderBy('date', 'asc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteAppointment = async (familyId, appointmentId) => {
  await deleteDoc(doc(db, 'families', familyId, 'appointments', appointmentId));
};
