import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function addPlayer(name: string, photoURL?: string) {
  try {
    const playerData: any = {
      name,
      wins: 0,
      losses: 0,
      streak: 0,
      createdAt: Timestamp.now(),
    };

    // Only add photoURL if provided
    if (photoURL) {
      playerData.photoURL = photoURL;
    }

    const docRef = await addDoc(collection(db, 'players'), playerData);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding player:', error);
    return { success: false, error };
  }
}

export async function updatePlayer(
  playerId: string,
  updates: { name?: string; photoURL?: string | null }
) {
  try {
    const playerRef = doc(db, 'players', playerId);
    const updateData: any = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }

    if (updates.photoURL !== undefined) {
      if (updates.photoURL === null) {
        // Remove photoURL field
        updateData.photoURL = null;
      } else {
        updateData.photoURL = updates.photoURL;
      }
    }

    await updateDoc(playerRef, updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating player:', error);
    return { success: false, error };
  }
}
