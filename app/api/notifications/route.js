import { adminMessaging, adminDb } from '@/lib/firebase-admin';

export async function POST(req) {
  try {
    const { familyId, targetUid, title, body, type } = await req.json();

    // Get target user's FCM token
    const userDoc = await adminDb.collection('users').doc(targetUid).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (fcmToken) {
      await adminMessaging.send({
        token: fcmToken,
        notification: { title, body },
        data: { type, familyId },
      });
    }

    // Log to Firestore
    await adminDb.collection('families').doc(familyId)
      .collection('notifications').add({
        targetUid, title, body, type,
        sentAt: new Date(),
        read: false,
      });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
