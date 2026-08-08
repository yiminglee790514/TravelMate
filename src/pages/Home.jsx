import { useEffect, useState } from "react";

import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import TripModal from "../components/TripModal";
import TripCard from "../components/TripCard";

import {
listenTrips,
createTrip,
updateTrip,
deleteTrip,
} from "../services/tripCloudService";

export default function Home() {

  const [showModal, setShowModal] = useState(false);

  const [editingTrip, setEditingTrip] = useState(null);

  const [trips, setTrips] = useState([]);

  function sortTrips(list) {

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [...list].sort((a, b) => {

    const aStart = new Date(a.startDate);
    const aEnd = new Date(a.endDate);

    const bStart = new Date(b.startDate);
    const bEnd = new Date(b.endDate);

    const aStatus =
      today < aStart ? 1 :
      today <= aEnd ? 0 : 2;

    const bStatus =
      today < bStart ? 1 :
      today <= bEnd ? 0 : 2;

    // 進行中 > 即將出發 > 已完成
    if (aStatus !== bStatus) {
      return aStatus - bStatus;
    }

    // 進行中
    if (aStatus === 0) {
      return aStart - bStart;
    }

    // 即將出發
    if (aStatus === 1) {
      return aStart - bStart;
    }

    // 已完成（最新完成排前面）
    return bEnd - aEnd;

  });

}

  useEffect(() => {

    const unsubscribe = listenTrips((data) => {

      setTrips(sortTrips(data));

    });

    return unsubscribe;

  }, []);

  async function handleAddTrip(trip) {

    try {

      await createTrip(trip);

      setShowModal(false);

    } catch (err) {

      console.error(err);

      alert(err.message);

    }

  }

async function handleEditTrip(trip) {

  try {

    await updateTrip(
      trip.id,
      trip
    );

    setEditingTrip(null);

    setShowModal(false);

  } catch (err) {

    console.error(err);

    alert(err.message);

  }

}

  async function handleDeleteTrip(id) {

    if (!window.confirm("確定要刪除這個旅程嗎？")) return;

    try {

      await deleteTrip(id);

    } catch (err) {

      console.error(err);

      alert(err.message);

    }

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">

      <div className="mx-auto max-w-md px-6 py-10">

        <Header />

        <button
          onClick={() => {

            setEditingTrip(null);

            setShowModal(true);

          }}
          className="
            w-full
            rounded-3xl
            bg-gradient-to-r
            from-blue-500
            to-indigo-600
            py-4
            text-lg
            font-semibold
            text-white
            shadow-lg
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-xl
          "
        >
          ✈️ 建立新旅程
        </button>

        <div className="mt-10 mb-4 flex items-center justify-between">

          <h2 className="text-xl font-bold text-gray-800">

            我的旅程

          </h2>

          <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">

            {trips.length} 個旅程

          </div>

        </div>

        {trips.length === 0 ? (

          <EmptyState />

        ) : (

          <div className="space-y-5">

            {trips.map((trip) => (

              <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={handleDeleteTrip}
                  onEdit={(trip)=>{

                      setEditingTrip(trip);

                      setShowModal(true);

                  }}
              />

            ))}

          </div>

        )}

      </div>

      {showModal && (

        <TripModal
              trip={editingTrip}
              onClose={() => {

                  setEditingTrip(null);

                  setShowModal(false);

              }}
              onSave={editingTrip ? handleEditTrip : handleAddTrip}
          />

      )}

    </div>

  );

}