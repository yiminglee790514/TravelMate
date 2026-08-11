import { useEffect, useMemo, useState } from "react";
import { auth } from "../firebase";
import { createInvite } from "../services/inviteService";
import useTrip from "../hooks/useTrip";

export default function MemberModal({
  trip,
  owner,
  onClose,
}) {
  const user = auth.currentUser;

  // 直接監聽同一趟旅程，讓 Owner 修改權限／移除後畫面立即更新
  const {
    trip: liveTrip,
    updateTrip,
  } = useTrip(trip?.id);

  const currentTrip = liveTrip || trip;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("editor");
  const [memberLoading, setMemberLoading] = useState(null);

  // --------------------------------------------------
  // 成員資料
  //
  // 目前 permissionService 使用：
  // members     = UID 陣列
  // memberRoles = { uid: "owner" | "editor" | "viewer" }
  //
  // 如果之後有 memberEmails / memberProfiles，
  // 這裡也會自動優先顯示 Email。
  // --------------------------------------------------

  const members = Array.isArray(currentTrip?.members)
    ? currentTrip.members
    : [];

  const memberRoles =
    currentTrip?.memberRoles &&
    typeof currentTrip.memberRoles === "object"
      ? currentTrip.memberRoles
      : {};

  const memberEmails =
    currentTrip?.memberEmails &&
    typeof currentTrip.memberEmails === "object"
      ? currentTrip.memberEmails
      : {};

  const memberProfiles =
    currentTrip?.memberProfiles &&
    typeof currentTrip.memberProfiles === "object"
      ? currentTrip.memberProfiles
      : {};

  const ownerUid = currentTrip?.owner || null;

  // Owner 也放進清單，但不重複
  const memberIds = useMemo(() => {
    const list = [...members];

    if (ownerUid && !list.includes(ownerUid)) {
      list.unshift(ownerUid);
    }

    if (
      user?.uid &&
      ownerUid === user.uid &&
      !list.includes(user.uid)
    ) {
      list.unshift(user.uid);
    }

    return [...new Set(list)];
  }, [members, ownerUid, user?.uid]);

  function getMemberEmail(uid) {
    if (uid === ownerUid) {
      return (
        currentTrip?.ownerEmail ||
        (uid === user?.uid ? user?.email : null) ||
        memberEmails[uid] ||
        memberProfiles[uid]?.email ||
        uid
      );
    }

    return (
      memberEmails[uid] ||
      memberProfiles[uid]?.email ||
      memberProfiles[uid]?.displayName ||
      uid
    );
  }

  function getMemberRole(uid) {
    if (uid === ownerUid) return "owner";
    return memberRoles[uid] || "editor";
  }

  // --------------------------------------------------
  // 邀請
  // --------------------------------------------------

  async function handleInvite() {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      alert("請輸入 Google Email");
      return;
    }

    if (
      user?.email &&
      cleanEmail.toLowerCase() === user.email.toLowerCase()
    ) {
      alert("不能邀請自己");
      return;
    }

    try {
      setLoading(true);

      await createInvite(
        currentTrip.id,
        cleanEmail,
        role
      );

      alert("邀請已送出！");
      setEmail("");
    } catch (err) {
      console.error(err);
      console.error(err?.stack);
      alert(err?.message || "邀請失敗");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // Owner 修改成員權限
  // --------------------------------------------------

  async function handleChangeRole(uid, newRole) {
    if (!owner) return;
    if (!uid || uid === ownerUid) return;

    try {
      setMemberLoading(uid);

      const updatedMemberRoles = {
        ...memberRoles,
        [uid]: newRole,
      };

      const updatedTrip = {
        ...currentTrip,
        memberRoles: updatedMemberRoles,
      };

      await updateTrip(updatedTrip);
    } catch (err) {
      console.error(err);
      alert(err?.message || "修改權限失敗");
    } finally {
      setMemberLoading(null);
    }
  }

  // --------------------------------------------------
  // Owner 移除成員
  // --------------------------------------------------

  async function handleRemoveMember(uid) {
    if (!owner) return;
    if (!uid || uid === ownerUid) return;

    const memberEmail = getMemberEmail(uid);

    if (
      !window.confirm(
        `確定要移除這位成員嗎？\n\n${memberEmail}`
      )
    ) {
      return;
    }

    try {
      setMemberLoading(uid);

      const updatedMembers = members.filter(
        (memberUid) => memberUid !== uid
      );

      const updatedMemberRoles = {
        ...memberRoles,
      };

      delete updatedMemberRoles[uid];

      const updatedMemberEmails = {
        ...memberEmails,
      };

      delete updatedMemberEmails[uid];

      const updatedMemberProfiles = {
        ...memberProfiles,
      };

      delete updatedMemberProfiles[uid];

      const updatedTrip = {
        ...currentTrip,
        members: updatedMembers,
        memberRoles: updatedMemberRoles,
        memberEmails: updatedMemberEmails,
        memberProfiles: updatedMemberProfiles,
      };

      await updateTrip(updatedTrip);
    } catch (err) {
      console.error(err);
      alert(err?.message || "移除成員失敗");
    } finally {
      setMemberLoading(null);
    }
  }

  return (
    <div
      className="tm-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* 標題 */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-5">
          <h2 className="text-lg font-bold">
            👥 共同編輯
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              px-2
              py-1
              text-xl
              text-gray-400
              hover:bg-gray-100
            "
          >
            ✕
          </button>
        </div>

        {/* 內容捲軸 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">

          {/* 建立者 */}
          <div className="mt-4 rounded-2xl bg-gray-50 p-4">
            <div className="text-xs font-semibold text-gray-500">
              建立者
            </div>

            <div className="mt-2 break-all text-sm font-semibold">
              {currentTrip?.ownerEmail || user?.email || ownerUid || "—"}
            </div>

            <div className="mt-1 text-sm text-gray-400">
              👑 Owner
            </div>
          </div>

          {/* 目前成員 */}
          <div className="mt-4 rounded-2xl bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-gray-500">
                目前成員
              </div>

              <div className="text-xs font-semibold text-gray-500">
                {memberIds.length} 人
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-700">
              {owner
                ? "👑 你是 Owner，可以修改成員權限或移除成員。"
                : "✏️ 你可以使用旅程，但不能管理其他成員。"}
            </div>

            <div className="mt-3 space-y-2.5">
              {memberIds.length === 0 ? (
                <div className="rounded-xl bg-white p-4 text-sm text-gray-400">
                  目前還沒有其他成員
                </div>
              ) : (
                memberIds.map((uid) => {
                  const memberRole = getMemberRole(uid);
                  const memberEmail = getMemberEmail(uid);
                  const isOwner = uid === ownerUid;
                  const busy = memberLoading === uid;

                  return (
                    <div
                      key={uid}
                      className="
                        rounded-2xl
                        bg-white
                        p-4
                        shadow-sm
                        ring-1
                        ring-gray-100
                      "
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg">
                          {isOwner ? "👑" : "👤"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="break-all text-sm font-semibold text-gray-800">
                            {memberEmail}
                          </div>

                          {uid === user?.uid && (
                            <div className="mt-0.5 text-xs text-blue-500">
                              你
                            </div>
                          )}

                          <div className="mt-1 text-xs text-gray-400">
                            {isOwner
                              ? "Owner"
                              : memberRole === "viewer"
                                ? "👀 僅觀看"
                                : "✏️ 可編輯"}
                          </div>
                        </div>

                        {/* Owner 才能管理其他成員 */}
                        {owner && !isOwner && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              handleRemoveMember(uid)
                            }
                            className="
                              shrink-0
                              rounded-lg
                              px-2
                              py-1
                              text-sm
                              text-red-500
                              hover:bg-red-50
                              disabled:opacity-40
                            "
                          >
                            移除
                          </button>
                        )}
                      </div>

                      {owner && !isOwner && (
                        <div className="mt-2.5 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              handleChangeRole(
                                uid,
                                "editor"
                              )
                            }
                            className={`
                              rounded-xl
                              border
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              ${
                                memberRole === "editor"
                                  ? "border-blue-500 bg-blue-50 text-blue-600"
                                  : "border-gray-200 bg-white text-gray-500"
                              }
                              disabled:opacity-40
                            `}
                          >
                            ✏️ 可編輯
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              handleChangeRole(
                                uid,
                                "viewer"
                              )
                            }
                            className={`
                              rounded-xl
                              border
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              ${
                                memberRole === "viewer"
                                  ? "border-blue-500 bg-blue-50 text-blue-600"
                                  : "border-gray-200 bg-white text-gray-500"
                              }
                              disabled:opacity-40
                            `}
                          >
                            👀 僅觀看
                          </button>
                        </div>
                      )}

                      {busy && (
                        <div className="mt-2 text-center text-xs text-gray-400">
                          處理中...
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 邀請 */}
          <div className="mt-4">
            <div className="text-xs font-semibold text-gray-500">
              邀請 Google 帳號
            </div>

            <input
              className="tm-modal-input mt-2"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleInvite();
                }
              }}
            />

            <div className="mt-2 text-xs text-gray-400">
              對方必須使用 Google 登入過 TravelMate 才能接受邀請。
            </div>

            {owner && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-gray-500">
                  新成員權限
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("editor")}
                    className={`
                      rounded-xl
                      border
                      px-3
                      py-3
                      text-xs
                      font-semibold
                      ${
                        role === "editor"
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 bg-white text-gray-500"
                      }
                    `}
                  >
                    ✏️ 可編輯
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("viewer")}
                    className={`
                      rounded-xl
                      border
                      px-3
                      py-3
                      text-xs
                      font-semibold
                      ${
                        role === "viewer"
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 bg-white text-gray-500"
                      }
                    `}
                  >
                    👀 僅觀看
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="flex shrink-0 justify-end gap-2.5 border-t bg-white px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="tm-modal-button bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            關閉
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleInvite}
            className="tm-modal-button bg-blue-500 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading ? "送出中..." : "📨 發送邀請"}
          </button>
        </div>
      </div>
    </div>
  );
}
