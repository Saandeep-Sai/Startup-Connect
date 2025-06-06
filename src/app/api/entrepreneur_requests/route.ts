import { db } from '@/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { senderId, receiverId } = await request.json();
    
    if (!senderId || !receiverId) {
      return NextResponse.json(
        { error: 'Missing senderId or receiverId' },
        { status: 400 }
      );
    }

    const requestRef = await addDoc(collection(db, 'entrepreneur_requests'), {
      senderId,
      receiverId,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    // Create notification for receiver
    await addDoc(collection(db, `notifications/${receiverId}/userNotifications`), {
      type: 'request_received',
      senderId,
      message: 'You received a new connection request',
      createdAt: serverTimestamp(),
      read: false,
    });

    return NextResponse.json(
      { requestId: requestRef.id, message: 'Request sent successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending request:', error);
    return NextResponse.json(
      { error: 'Failed to send request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const sentQuery = query(
      collection(db, 'entrepreneur_requests'),
      where('senderId', '==', userId)
    );
    const receivedQuery = query(
      collection(db, 'entrepreneur_requests'),
      where('receiverId', '==', userId)
    );

    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery),
    ]);

    const sentRequests = sentSnapshot.docs.map(doc => ({ requestId: doc.id, ...doc.data() }));
    const receivedRequests = receivedSnapshot.docs.map(doc => ({ requestId: doc.id, ...doc.data() }));

    return NextResponse.json(
      { sent: sentRequests, received: receivedRequests },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { requestId, status } = await request.json();

    if (!requestId || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Missing requestId or invalid status' },
        { status: 400 }
      );
    }

    const requestRef = doc(db, 'entrepreneur_requests', requestId);
    await updateDoc(requestRef, { status });

    // Fetch request to get senderId for notification
    const requestDoc = await getDoc(requestRef);
    const requestData = requestDoc.data();
    if (requestData) {
      await addDoc(collection(db, `notifications/${requestData.senderId}/userNotifications`), {
        type: `request_${status}`,
        senderId: requestData.receiverId,
        message: `Your connection request was ${status}`,
        createdAt: serverTimestamp(),
        read: false,
      });
    }

    return NextResponse.json(
      { message: `Request ${status} successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}