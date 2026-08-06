import { useEffect, useState } from "react";

import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import TripModal from "../components/TripModal";
import TripCard from "../components/TripCard";

import {
  listenTrips,
  createTrip,
  deleteTrip,
} from "../services/tripCloudService";

export default function Home() {

  const [showModal, setShowModal] = useState(false);

  const [trips, setTrips] = useState([]);

  useEffect(() => {

    const unsubscribe = listenTrips((data) => {

      setTrips(data);

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
          onClick={() => setShowModal(true)}
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
              />

            ))}

          </div>

        )}

      </div>

      {showModal && (

        <TripModal
          onClose={() => setShowModal(false)}
          onSave={handleAddTrip}
        />

      )}

    </div>

  );

}