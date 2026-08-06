import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";

export async function createUserProfile() {

  const user = auth.currentUser;

  if (!user) return;

  const ref = doc(
    db,
    "users",
    user.uid
  );

  const snap = await getDoc(ref);

  if (snap.exists()) return;

  await setDoc(ref, {

    uid: user.uid,

    email: user.email,

    displayName: user.displayName,

    photoURL: user.photoURL,

    createdAt: serverTimestamp(),

  });

}