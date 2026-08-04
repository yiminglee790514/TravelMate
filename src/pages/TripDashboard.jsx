import { Link, useParams } from "react-router-dom";
import { useState } from "react";

import tripService from "../services/tripService";
import TripModal from "../components/TripModal";

export default function TripDashboard() {

  const { id } = useParams();

  const [showTripModal, setShowTripModal] = useState(false);

  const trip = tripService.getTrip(id);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        找不到旅程
      </div>
    );
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

          <button
            onClick={() => setShowTripModal(true)}
            className="rounded-xl p-2 text-xl transition hover:bg-gray-100"
            title="修改旅程"
          >
            ✏️
          </button>

        </div>

        <h1 className="mt-6 text-4xl font-bold">
          {trip.title}
        </h1>

        <p className="mt-2 text-gray-500">
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

          <button
            className="flex w-full items-center justify-between rounded-2xl bg-white p-5 shadow transition hover:shadow-lg"
          >
            <span>🏨 飯店</span>
            <span>›</span>
          </button>

          <button
            className="flex w-full items-center justify-between rounded-2xl bg-white p-5 shadow transition hover:shadow-lg"
          >
            <span>🚆 交通</span>
            <span>›</span>
          </button>

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

        </div>

      </div>

      {showTripModal && (

        <TripModal
          trip={trip}
          onClose={() => setShowTripModal(false)}
          onSave={(updatedTrip) => {
            tripService.updateTrip(updatedTrip);
            setShowTripModal(false);
            window.location.reload();
          }}
        />

      )}

    </div>
  );
}