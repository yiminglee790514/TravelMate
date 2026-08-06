import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

const STORAGE_KEY = "travelmate-trips";

/* 下載雲端資料 */

export async function syncCloudToLocal() {

  const user = auth.currentUser;

  if (!user) return;

  const ref = doc(db, "users", user.uid);

  const snap = await getDoc(ref);

  // 第一次登入，自動建立使用者資料
  if (!snap.exists()) {

    await setDoc(ref, {
      trips: [],
    });

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([])
    );

    return;

  }

  const data = snap.data();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data.trips || [])
  );

}

/* 上傳雲端資料 */

export async function syncLocalToCloud(trips) {

  const user = auth.currentUser;

  if (!user) return;

  const ref = doc(db, "users", user.uid);

  await setDoc(
    ref,
    {
      trips,
    },
    {
      merge: true,
    }
  );

}