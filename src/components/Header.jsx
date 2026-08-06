import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { logout } from "../services/authService";
import {
  getMyInvites,
  acceptInvite,
  rejectInvite,
} from "../services/inviteService";

export default function Header() {

  const user = auth.currentUser;

  const [open, setOpen] = useState(false);

  const [invites, setInvites] = useState([]);

  useEffect(() => {

    async function loadInvites() {

      try {

        const data = await getMyInvites();

        setInvites(data);

      } catch (err) {

        console.error(err);

      }

    }

    loadInvites();

  }, []);

  async function handleLogout() {

    if (!confirm("確定要登出嗎？")) return;

    localStorage.removeItem("travelmate-trips");

    await logout();

  }

  async function handleAccept(invite) {

    await acceptInvite(invite);

    setInvites(

      invites.filter(

        (i) => i.id !== invite.id

      )

    );

    alert("已加入共同旅程！");

  }

  async function handleReject(invite) {

    await rejectInvite(invite.id);

    setInvites(

      invites.filter(

        (i) => i.id !== invite.id

      )

    );

  }

  return (

    <header className="mb-10">

      <div className="flex items-start justify-between">

        <div className="flex items-center gap-3">

          <div className="text-5xl">
            🌏
          </div>

          <div>

            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              行程規劃
            </h1>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-lg font-semibold text-transparent">
              Plan Every Journey
            </div>

          </div>

        </div>

        <div className="flex items-center gap-3">
          {/* 通知 */}

          <div className="relative">

            <button
              onClick={() => setOpen(open === "invite" ? false : "invite")}
              className="relative flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-xl shadow hover:bg-amber-500"
            >
              🔔

              {invites.length > 0 && (

                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">

                  {invites.length}

                </div>

              )}

            </button>

            {open === "invite" && (

              <div className="absolute right-0 z-50 mt-3 w-80 rounded-2xl bg-white p-4 shadow-2xl">

                <div className="mb-4 text-lg font-bold">

                  邀請通知

                </div>

                {invites.length === 0 ? (

                  <div className="py-6 text-center text-sm text-gray-400">

                    沒有新的邀請

                  </div>

                ) : (

                  invites.map((invite) => (

                    <div
                      key={invite.id}
                      className="mb-4 rounded-xl border p-3"
                    >

                      <div className="font-semibold">

                        {invite.tripTitle}

                      </div>

                      <div className="mt-1 text-sm text-gray-500">

                        {invite.ownerEmail}

                      </div>

                      <div className="mt-4 flex gap-2">

                        <button
                          onClick={() => handleAccept(invite)}
                          className="flex-1 rounded-xl bg-green-500 py-2 text-white hover:bg-green-600"
                        >
                          接受
                        </button>

                        <button
                          onClick={() => handleReject(invite)}
                          className="flex-1 rounded-xl bg-gray-200 py-2 hover:bg-gray-300"
                        >
                          拒絕
                        </button>

                      </div>

                    </div>

                  ))

                )}

              </div>

            )}

          </div>

          {/* 使用者 */}

          <div className="relative">

            <button
              onClick={() => setOpen(open === "user" ? false : "user")}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white shadow hover:bg-blue-600"
            >
              {user?.displayName?.charAt(0) || "👤"}
            </button>

            {open === "user" && (

              <div className="absolute right-0 z-50 mt-3 w-64 rounded-2xl bg-white p-4 shadow-2xl">

                <div className="font-bold">

                  {user?.displayName}

                </div>

                <div className="mt-1 break-all text-sm text-gray-500">

                  {user?.email}

                </div>

                <div className="mt-4 border-t pt-4">

                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl bg-red-500 py-2 font-semibold text-white hover:bg-red-600"
                  >
                    🚪 登出
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

      <p className="mt-4 text-gray-500">

        規劃每一次旅行，留下每一段回憶 ✈️

      </p>

    </header>

  );

}