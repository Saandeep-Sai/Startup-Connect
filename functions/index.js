/* eslint-disable @typescript-eslint/no-unused-vars */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

admin.initializeApp();

export const createEntrepreneurRequest = functions.https.onCall(async (data, _) => {
  const { senderId, receiverId } = data;
  try {
    const requestRef = await admin.firestore().collection('entrepreneur_requests').add({
      senderId,
      receiverId,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    await admin.firestore().collection(`notifications/${receiverId}/userNotifications`).add({
      type: 'connection_request',
      senderId,
      message: `New connection request from ${senderId}`,
      createdAt: Timestamp.now(),
      read: false,
    });

    return { requestId: requestRef.id };
  } catch (error) {
    console.error('Error creating request:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create request');
  }
});

export const updateEntrepreneurRequest = functions.https.onCall(async (data, _) => {
  const { requestId, status } = data;
  try {
    await admin.firestore().collection('entrepreneur_requests').doc(requestId).update({
      status,
      updatedAt: Timestamp.now(),
    });
    return { message: 'Request updated successfully' };
  } catch (error) {
    console.error('Error updating request:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update request');
  }
});