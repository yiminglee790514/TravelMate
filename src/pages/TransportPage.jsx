import { Link, useParams } from "react-router-dom";
import { useState } from "react";

import tripService from "../services/tripService";
import TransportModal from "../components/TransportModal";
import TransportCard from "../components/TransportCard";

export default function TransportPage() {

  const { id } = useParams();

  const [showModal, setShowModal] = useState(false);
  const [editingTransport, setEditingTransport] = useState(null);

  const trip = tripService.getTrip(id);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        找不到旅程
      </div>
    );
  }

  function handleSaveTransport(transport) {

    const index = trip.transports.findIndex(
      (t) => t.id === transport.id
    );

    if (index === -1) {

      trip.transports.push(transport);

    } else {

      trip.transports[index] = transport;

    }

    tripService.updateTrip(trip);

    setEditingTransport(null);
    setShowModal(false);

  }

  function handleDeleteTransport(id) {

    if (!confirm("確定刪除此交通？")) return;

    trip.transports = trip.transports.filter(
      (t) => t.id !== id
    );

    tripService.updateTrip(trip);

    setEditingTransport(null);

    window.location.reload();

  }

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-md px-6 py-10">

        <Link
          to={`/trip/${id}`}
          className="text-blue-500"
        >
          ← 返回旅程
        </Link>

        <h1 className="mt-6 text-4xl font-bold">
          🚆 交通
        </h1>

        <button
          onClick={() => {

            setEditingTransport(null);

            setShowModal(true);

          }}
          className="
            mt-8
            w-full
            rounded-2xl
            bg-blue-500
            py-4
            text-lg
            font-semibold
            text-white
          "
        >
          ＋ 新增交通
        </button>

        <div className="mt-8 space-y-4">

          {trip.transports.length === 0 ? (

            <div className="rounded-2xl bg-white p-8 text-center text-gray-400 shadow">

              尚未新增交通

            </div>

          ) : (

            trip.transports.map((transport) => (

              <TransportCard
                key={transport.id}
                transport={transport}

                onEdit={() => {

                  setEditingTransport(transport);

                  setShowModal(true);

                }}

                onDelete={() => {

                  handleDeleteTransport(transport.id);

                }}

              />

            ))

          )}

        </div>

      </div>

      {showModal && (

        <TransportModal
          transport={editingTransport}

          onClose={() => {

            setEditingTransport(null);

            setShowModal(false);

          }}

          onSave={handleSaveTransport}

        />

      )}

    </div>

  );

}