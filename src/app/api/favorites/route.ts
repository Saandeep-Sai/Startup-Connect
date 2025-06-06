import { db } from '@/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, startupId } = await request.json();

    if (!userId || !startupId) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const favoriteRef = await addDoc(collection(db, 'favorites'), {
      userId,
      startupId,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ favoriteId: favoriteRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return NextResponse.json(
      snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { favoriteId } = await request.json();

    if (!favoriteId) {
      return NextResponse.json({ error: 'Missing favoriteId' }, { status: 400 });
    }

    await deleteDoc(doc(db, 'favorites', favoriteId));
    return NextResponse.json({ message: 'Favorite removed' }, { status: 200 });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}