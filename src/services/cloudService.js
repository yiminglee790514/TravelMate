import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

/* ===========================
   同步使用者資料
=========================== */

export async function syncCloudToLocal() {

  const user = auth.currentUser;

  if (!user) return;

  const ref = doc(db, "users", user.uid);

  const snap = await getDoc(ref);

  // 第一次登入
  if (!snap.exists()) {

    await setDoc(ref, {

      email: user.email,

      displayName: user.displayName,

      photoURL: user.photoURL || "",

      createdAt: new Date(),

    });

    return;

  }

  // 每次登入更新使用者資訊
  await setDoc(

    ref,

    {

      email: user.email,

      displayName: user.displayName,

      photoURL: user.photoURL || "",

      lastLogin: new Date(),

    },

    {

      merge: true,

    }

  );

}

/* ===========================
   已不再使用
=========================== */

export async function syncLocalToCloud() {

  // Firestore 版已不需要 localStorage 同步

}