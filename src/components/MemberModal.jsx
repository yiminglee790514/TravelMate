import { useState } from "react";
import { auth } from "../firebase";
import { createInvite } from "../services/inviteService";

export default function MemberModal({

  trip,

  onClose,

}) {

  const user = auth.currentUser;

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

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

        email.trim()

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

          <div className="mt-2 text-sm text-gray-600">

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

                : "📨 發送邀請"

            }

          </button>

        </div>

      </div>

    </div>

  );

}