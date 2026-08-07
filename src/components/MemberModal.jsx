import { useState } from "react";
import { auth } from "../firebase";
import { createInvite } from "../services/inviteService";

export default function MemberModal({

  trip,

  owner,

  onClose,

}) {

  const user = auth.currentUser;

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState("editor");

  async function handleInvite() {

    if (!email.trim()) {

      alert("請輸入 Google Email");

      return;

    }

    if (

      email.trim().toLowerCase() ===

      user.email.toLowerCase()

    ) {

      alert("不能邀請自己");

      return;

    }

    try {

      setLoading(true);

      await createInvite(

        trip.id,

        email.trim(),

        role

      );

      alert("邀請已送出！");

      setEmail("");

    } catch (err) {

      console.error(err);

      console.error(err.stack);

      alert(err.message);

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-[430px] rounded-3xl bg-white p-8 shadow-2xl">

        <div className="flex items-center justify-between">

          <h2 className="text-2xl font-bold">

            👥 共同編輯

          </h2>

          <button

            onClick={onClose}

            className="rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-100"

          >

            ✕

          </button>

        </div>

        <div className="mt-6 rounded-2xl bg-gray-50 p-4">

          <div className="text-sm font-semibold text-gray-500">

            建立者

          </div>

          <div className="mt-2 font-semibold">

            {trip.ownerEmail || user.email}

          </div>

        </div>

        <div className="mt-5 rounded-2xl bg-gray-50 p-4">

          <div className="text-sm font-semibold text-gray-500">

            目前成員

          </div>

          <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-700">

            {owner

              ? "👑 你是 Owner，可邀請、修改權限及移除成員。"

              : "✏️ 你是 Editor，可邀請成員，但不能修改權限或移除成員。"

            }

          </div>

          <div className="mt-3 text-sm text-gray-600">

            {trip.members?.length || 1} 人

          </div>

        </div>

        <div className="mt-6">

          <div className="text-sm font-semibold text-gray-500">

            邀請 Google 帳號

          </div>

          <input

            className="mt-3 w-full rounded-xl border p-3"

            placeholder="example@gmail.com"

            value={email}

            onChange={(e) =>

              setEmail(e.target.value)

            }

            onKeyDown={(e) => {

              if (

                e.key === "Enter" &&

                !loading

              ) {

                handleInvite();

              }

            }}

          />

          <div className="mt-2 text-xs text-gray-400">

            對方必須使用 Google 登入過 TravelMate 才能接受邀請。

          </div>

          {owner && (

            <div className="mt-6">

              <div className="text-sm font-semibold text-gray-500">

                權限

              </div>

              <div className="mt-3 space-y-2">

                <label className="flex items-center gap-2">

                  <input

                    type="radio"

                    checked={role === "editor"}

                    onChange={() => setRole("editor")}

                  />

                  ✏️ 可編輯

                </label>

                <label className="flex items-center gap-2">

                  <input

                    type="radio"

                    checked={role === "viewer"}

                    onChange={() => setRole("viewer")}

                  />

                  👀 僅觀看

                </label>

              </div>

            </div>

          )}

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button

            onClick={onClose}

            className="rounded-xl bg-gray-200 px-5 py-3 hover:bg-gray-300"

          >

            關閉

          </button>

          <button

            disabled={loading}

            onClick={handleInvite}

            className="rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"

          >

            {

              loading

                ? "送出中..."

                : owner

                  ? "📨 發送邀請"

                  : "📨 邀請成員"

            }

          </button>

        </div>

      </div>

    </div>

  );

}