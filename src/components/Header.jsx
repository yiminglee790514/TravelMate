import { useState } from "react";
import { auth } from "../firebase";
import { logout } from "../services/authService";

export default function Header() {

  const user = auth.currentUser;

  const [open, setOpen] = useState(false);

  async function handleLogout() {

    if (!confirm("確定要登出嗎？")) return;

    localStorage.removeItem("travelmate-trips");

    await logout();

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

        {/* 使用者 */}

        <div className="relative">

          <button
            onClick={() => setOpen(!open)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white shadow hover:bg-blue-600"
          >
            {user?.displayName?.charAt(0) || "👤"}
          </button>

          {open && (

            <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white p-4 shadow-xl">

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

      <p className="mt-4 text-gray-500">
        規劃每一次旅行，留下每一段回憶 ✈️
      </p>

    </header>

  );

}