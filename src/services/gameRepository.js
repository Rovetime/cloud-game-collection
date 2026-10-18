
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

import { db } from './firebaseConfig';

const gamesCollection = 'games';

// READ — Retrieve all games from Firestore
export async function getGames() {
  if (!db) {
    throw new Error('Firebase is not configured.');
  }

  const snapshot = await getDocs(
    collection(db, gamesCollection)
  );

  return snapshot.docs.map((gameDoc) => ({
    ...gameDoc.data(),
    id: gameDoc.id,
  }));
}

// CREATE — Add a new game
export async function addGame(game) {
  if (!db) {
    throw new Error('Firebase is not configured.');
  }

  const { id, ...gameData } = game;

  const documentRef = await addDoc(
    collection(db, gamesCollection),
    gameData
  );

  return {
    ...gameData,
    id: documentRef.id,
  };
}

// UPDATE — Modify an existing game
export async function updateGame(id, changes) {
  if (!db) {
    throw new Error('Firebase is not configured.');
  }

  const { id: ignoredId, ...updateData } = changes;

  await updateDoc(
    doc(db, gamesCollection, id),
    updateData
  );

  return {
    id,
    ...updateData,
  };
}

// DELETE — Remove a game
export async function deleteGame(id) {
  if (!db) {
    throw new Error('Firebase is not configured.');
  }

  await deleteDoc(
    doc(db, gamesCollection, id)
  );

  return id;
}
