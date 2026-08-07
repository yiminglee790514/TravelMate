import { Link, useParams } from "react-router-dom";
import { useState } from "react";

import useTrip from "../hooks/useTrip";
import TripModal from "../components/TripModal";
import MemberModal from "../components/MemberModal";

import { createShare } from "../services/shareService";
import {
  canEdit,
  isOwner,
} from "../services/permissionService";

export default function TripDashboard() {

  const { id } = useParams();

  const [showTripModal, setShowTripModal] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);

  const { trip, updateTrip } = useTrip(id);

  if (!trip) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        載入中...

      </div>

    );

  }

  const editable = canEdit(trip);

  const owner = isOwner(trip);

  async function handleShare() {

    const shareId = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    await createShare(shareId, trip);

    const url =
      `${window.location.origin}/share/${shareId}`;

    await navigator.clipboard.writeText(url);

    alert(`分享連結已複製！\n\n${url}`);

  }

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-md px-6 py-10">

        <div className="flex items-center justify-between">

          <Link
            to="/"
            className="text-blue-500"
          >
            ← 回首頁
          </Link>

        </div>

        <h1 className="mt-6 text-4xl font-bold">

          {trip.title}

        </h1>

        {editable && (

          <div className="mt-5 flex gap-3">

            <button
              onClick={handleShare}
              className="flex-1 rounded-xl bg-green-500 py-3 text-white transition hover:bg-green-600"
            >
              🔗 分享
            </button>

            <button
              onClick={() => setShowMemberModal(true)}
              className="flex-1 rounded-xl bg-blue-500 py-3 text-white transition hover:bg-blue-600"
            >
              👥 成員
            </button>

          </div>

        )}

        <p className="mt-4 text-gray-500">

          📍 {trip.country}｜{trip.city}

        </p>

        <p className="mt-2 text-gray-500">

          📅 {trip.startDate} ~ {trip.endDate}

        </p>

        <div className="mt-10 space-y-4">

          <Link
            to={`/trip/${id}/flight`}
            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow transition hover:shadow-lg"
          >
            <span>✈️ 航班</span>
            <span>›</span>
          </Link>

          <Link
            to={`/trip/${id}/hotel`}
            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow transition hover:shadow-lg"
          >
            <span>🏨 飯店</span>
            <span>›</span>
          </Link>

          <Link
            to={`/trip/${id}/transport`}
            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow transition hover:shadow-lg"
          >
            <span>🚆 交通</span>
            <span>›</span>
          </Link>

          <Link
            to={`/trip/${id}/weather`}
            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow transition hover:shadow-lg"
          >
            <span>🌤️ 天氣</span>
            <span>›</span>
          </Link>

          <Link
            to={`/trip/${id}/itinerary`}
            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow transition hover:shadow-lg"
          >
            <span>📅 行程表</span>
            <span>›</span>
          </Link>

          <button
            className="flex w-full items-center justify-between rounded-2xl bg-white p-5 shadow transition hover:shadow-lg"
          >
            <span>💰 花費</span>
            <span>›</span>
          </button>

          <Link
            to={`/trip/${id}/packing`}
            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow transition hover:shadow-lg"
            >
            <span>🧳 行李清單</span>
            <span>›</span>
          </Link>

        </div>

      </div>

      {editable && showTripModal && (

        <TripModal
          trip={trip}
          onClose={() => setShowTripModal(false)}
          onSave={async (updatedTrip) => {

            await updateTrip(updatedTrip);

            setShowTripModal(false);

          }}
        />

      )}

      {editable && showMemberModal && (

        <MemberModal
          trip={trip}
          owner={owner}
          onClose={() => setShowMemberModal(false)}
        />

      )}

    </div>

  );

}