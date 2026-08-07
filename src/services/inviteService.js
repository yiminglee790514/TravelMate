import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  doc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";

const inviteRef = collection(db, "invites");
const userRef = collection(db, "users");

/* ===========================
   建立邀請
=========================== */

export async function createInvite(
  tripId,
  email,
  role = "editor"
) {

  const user = auth.currentUser;

  if (!user) {

    throw new Error("尚未登入");

  }

  const userQuery = query(

    userRef,

    where("email", "==", email)

  );

  const userSnapshot = await getDocs(userQuery);

  if (userSnapshot.empty) {

    throw new Error("找不到此 Google 帳號");

  }

  const inviteUser = userSnapshot.docs[0];

  if (inviteUser.id === user.uid) {

    throw new Error("不能邀請自己");

  }


    console.log("tripId =", tripId);
    console.log("typeof tripId =", typeof tripId);
    console.log("tripId JSON =", JSON.stringify(tripId));

  const tripRef = doc(

    db,

    "trips",

    tripId

  );

  const tripSnapshot = await getDoc(tripRef);

  if (!tripSnapshot.exists()) {

    throw new Error("旅程不存在");

  }

  const trip = tripSnapshot.data();

  if (

    trip.members?.includes(inviteUser.id)

  ) {

    throw new Error("對方已經是共同編輯者");

  }

  const inviteQuery = query(

    inviteRef,

    where("tripId", "==", tripId),

    where("inviteUid", "==", inviteUser.id),

    where("status", "==", "pending")

  );

  const inviteSnapshot = await getDocs(inviteQuery);

  if (!inviteSnapshot.empty) {

    throw new Error("已經送出邀請");

  }

  await addDoc(inviteRef, {

  tripId,

  tripTitle: trip.title,

  ownerUid: user.uid,

  ownerEmail: user.email,

  inviteUid: inviteUser.id,

  inviteEmail: email,

  role,

  status: "pending",

  createdAt: serverTimestamp(),

});

}

/* ===========================
   我的邀請
=========================== */

export async function getMyInvites() {

  const user = auth.currentUser;

  if (!user) return [];

  const q = query(

    inviteRef,

    where("inviteUid", "==", user.uid),

    where("status", "==", "pending")

  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({

    id: doc.id,

    ...doc.data(),

  }));

}

/* ===========================
   接受邀請
=========================== */

export async function acceptInvite(invite) {

  const tripRef = doc(

    db,

    "trips",

    invite.tripId

  );

  const tripSnapshot = await getDoc(tripRef);

  if (!tripSnapshot.exists()) {

    throw new Error("旅程不存在");

  }

  const trip = tripSnapshot.data();

  await updateDoc(

    tripRef,

    {

      members: arrayUnion(invite.inviteUid),

      memberRoles: {

        ...(trip.memberRoles || {}),

        [invite.inviteUid]: invite.role || "editor",

      },

      updatedAt: serverTimestamp(),

    }

  );

  await deleteDoc(

    doc(

      db,

      "invites",

      invite.id

    )

  );

}

/* ===========================
   拒絕邀請
=========================== */

export async function rejectInvite(inviteId) {

  await deleteDoc(
    doc(db, "invites", inviteId)
  );

}