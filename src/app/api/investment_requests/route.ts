import { db } from '@/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { startupId, investorId, ownerId } = await request.json();
    
    if (!startupId || !investorId || !ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields: startupId, investorId, or ownerId' },
        { status: 400 }
      );
    }

    const requestRef = await addDoc(collection(db, 'investment_requests'), {
      startupId,
      investorId,
      ownerId,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, `notifications/${ownerId}/userNotifications`), {
      type: 'investment_request_received',
      senderId: investorId,
      message: 'New investment request received',
      createdAt: serverTimestamp(),
      read: false,
    });

    return NextResponse.json(
      { requestId: requestRef.id, message: 'Investment request sent' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating investment request:', error);
    return NextResponse.json(
      { error: 'Failed to send investment request' },
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
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const receivedQuery = query(
      collection(db, 'investment_requests'),
      where('ownerId', '==', userId)
    );

    const receivedSnapshot = await getDocs(receivedQuery);
    const receivedRequests = receivedSnapshot.docs.map(doc => ({ requestId: doc.id, ...doc.data() }));

    return NextResponse.json(
      { received: receivedRequests },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving investment requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investment requests' },
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

    const requestRef = doc(db, 'investment_requests', requestId);
    await updateDoc(requestRef, { status });

    const requestDoc = await getDoc(requestRef);
    const requestData = requestDoc.data();
    if (requestData) {
      await addDoc(collection(db, `notifications/${requestData.investorId}/userNotifications`), {
        type: `investment_request_${status}`,
        senderId: requestData.ownerId,
        message: `Your investment request was ${status}`,
        createdAt: serverTimestamp(),
        read: false,
      });
    }

    return NextResponse.json(
      { message: `Investment request ${status} successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating investment request:', error);
    return NextResponse.json(
      { error: 'Failed to update investment request' },
      { status: 500 }
    );
  }
}