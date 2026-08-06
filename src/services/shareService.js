import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase";

// 建立分享
export async function createShare(shareId, trip) {

  const ref = doc(db, "shares", shareId);

  await setDoc(ref, {
    trip,
    createdAt: Date.now(),
  });

}

// 取得分享資料
export async function getShare(shareId) {

  const ref = doc(db, "shares", shareId);

  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return snap.data().trip;

}