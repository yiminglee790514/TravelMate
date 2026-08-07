import { auth } from "../firebase";

/* ===========================
   取得目前使用者角色
=========================== */

export function getRole(trip) {

  const user = auth.currentUser;

  if (!user || !trip) return null;

  // 新版：使用 memberRoles
  if (trip.memberRoles) {

    return trip.memberRoles[user.uid] || null;

  }

  // 相容舊版旅程
  if (trip.owner === user.uid) {

    return "owner";

  }

  if (trip.members?.includes(user.uid)) {

    return "editor";

  }

  return null;

}

/* ===========================
   是否為 Owner
=========================== */

export function isOwner(trip) {

  return getRole(trip) === "owner";

}

/* ===========================
   是否可以編輯
=========================== */

export function canEdit(trip) {

  const role = getRole(trip);

  return role === "owner" || role === "editor";

}

/* ===========================
   是否只能觀看
=========================== */

export function isViewer(trip) {

  return getRole(trip) === "viewer";

}