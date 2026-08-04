import { useEffect, useState } from "react";

import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import AddTripModal from "../components/AddTripModal";
import TripCard from "../components/TripCard";

import tripService from "../services/tripService";

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  const [trips, setTrips] = useState([]);

  useEffect(() => {
    setTrips(tripService.getTrips());
  }, []);

  function handleAddTrip(trip) {
    tripService.addTrip(trip);

    setTrips(tripService.getTrips());

    setShowModal(false);
  }

  function handleDeleteTrip(id) {
    tripService.deleteTrip(id);

    setTrips(tripService.getTrips());
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-md px-6 py-10">

        <Header />

        <button
          onClick={() => setShowModal(true)}
          className="w-full rounded-2xl bg-blue-500 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-600"
        >
          ✈️ 新增旅程
        </button>

        {trips.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
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
        <AddTripModal
          onClose={() => setShowModal(false)}
          onSave={handleAddTrip}
        />
      )}

    </div>
  );
}