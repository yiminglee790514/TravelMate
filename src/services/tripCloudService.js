import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";

const tripsRef = collection(db, "trips");

/* ===========================
   建立旅程
=========================== */

export async function createTrip(trip) {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("尚未登入");
  }

  const docRef = await addDoc(tripsRef, {

  ...trip,

  owner: user.uid,

  members: [
    user.uid,
  ],

  memberRoles: {

    [user.uid]: "owner",

  },

  createdAt: serverTimestamp(),

  updatedAt: serverTimestamp(),

});

  return docRef.id;

}

/* ===========================
   我的旅程
=========================== */

export async function getTripsByUser() {

  const user = auth.currentUser;

  if (!user) return [];

  const q = query(
    tripsRef,
    where(
      "members",
      "array-contains",
      user.uid
    )
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({

    ...doc.data(),
    
    id: doc.id,

  }));

}

/* ===========================
   取得旅程
=========================== */

export async function getTrip(id) {

  const snapshot = await getDoc(

    doc(db, "trips", id)

  );

  if (!snapshot.exists()) {

    return null;

  }

  return {

    ...snapshot.data(),

    id: snapshot.id,

  };

}

/* ===========================
   更新旅程
=========================== */

export async function updateTrip(id, trip) {

  const {

    id: _,

    ...data

  } = trip;

  await updateDoc(

    doc(db, "trips", id),

    {

      ...data,

      updatedAt: serverTimestamp(),

    }

  );

}

/* ===========================
   刪除旅程
=========================== */

export async function deleteTrip(id) {

  await deleteDoc(

    doc(db, "trips", id)

  );

}
/* ===========================
   新增共同編輯者
=========================== */

export async function addMember(tripId, uid) {

  await updateDoc(

    doc(db, "trips", tripId),

    {

      members: arrayUnion(uid),

      updatedAt: serverTimestamp(),

    }

  );

}

/* ===========================
   移除共同編輯者
=========================== */

export async function removeMember(tripId, uid) {

  await updateDoc(

    doc(db, "trips", tripId),

    {

      members: arrayRemove(uid),

      updatedAt: serverTimestamp(),

    }

  );

}

/* ===========================
   即時監聽單一旅程
=========================== */

export function listenTrip(tripId, callback) {

  return onSnapshot(

    doc(db, "trips", tripId),

    (snapshot) => {

      if (!snapshot.exists()) {

        callback(null);

        return;

      }

      callback({

        ...snapshot.data(),

        id: snapshot.id,

      });

    }

  );

}

/* ===========================
   即時監聽我的旅程
=========================== */

export function listenTrips(callback) {

  const user = auth.currentUser;

  if (!user) {

    callback([]);

    return () => {};

  }

  const q = query(

    tripsRef,

    where(

      "members",

      "array-contains",

      user.uid

    )

  );

  return onSnapshot(

    q,

    (snapshot) => {

        callback(

        snapshot.docs.map(doc => ({

            ...doc.data(),

            id: doc.id,

        }))

        );

    }

  );

}