import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAY9w2cI1a9alhGBnzpP9jcMVC3Jk52VcI",
  authDomain: "travelmate-72b27.firebaseapp.com",
  projectId: "travelmate-72b27",
  storageBucket: "travelmate-72b27.firebasestorage.app",
  messagingSenderId: "926826472231",
  appId: "1:926826472231:web:9edeb3bc804a47cb79ff02",
};


const app = initializeApp(firebaseConfig);


// =========================
// Firebase Authentication
// =========================

export const auth = getAuth(app);

export const provider =
  new GoogleAuthProvider();


// =========================
// Firestore
//
// 開啟瀏覽器本機快取
// 讓手機再次開啟時可以先使用
// 上一次的資料
// =========================

export const db =
  initializeFirestore(app, {

    localCache:
      persistentLocalCache({

        tabManager:
          persistentMultipleTabManager(),

      }),

  });