import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import tripService from "../services/tripService";
import { getShare } from "../services/shareService";

import TransportModal from "../components/TransportModal";
import TransportCard from "../components/TransportCard";

export default function TransportPage() {

  const { id, shareId } = useParams();

  const readonly = !!shareId;

  const [trip, setTrip] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingTransport, setEditingTransport] = useState(null);

  useEffect(() => {

    async function loadTrip() {

      if (readonly) {

        const data = await getShare(shareId);

        setTrip(data);

      } else {

        setTrip(tripService.getTrip(id));

      }

    }

    loadTrip();

  }, [id, shareId, readonly]);

  if (!trip) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        載入中...
      </div>
    );

  }

  function handleSaveTransport(transport) {

    const updatedTrip = { ...trip };

    updatedTrip.transports = [...updatedTrip.transports];

    const index = updatedTrip.transports.findIndex(
      (t) => t.id === transport.id
    );

    if (index === -1) {

      updatedTrip.transports.push(transport);

    } else {

      updatedTrip.transports[index] = transport;

    }

    tripService.updateTrip(updatedTrip);

    setTrip(updatedTrip);

    setEditingTransport(null);
    setShowModal(false);

  }

  function handleDeleteTransport(id) {

    if (!confirm("確定刪除此交通？")) return;

    const updatedTrip = { ...trip };

    updatedTrip.transports =
      updatedTrip.transports.filter(
        (t) => t.id !== id
      );

    tripService.updateTrip(updatedTrip);

    setTrip(updatedTrip);

    setEditingTransport(null);

  }

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-md px-6 py-10">

        <Link
          to={
            readonly
              ? `/share/${shareId}`
              : `/trip/${id}`
          }
          className="text-blue-500"
        >
          ← 返回旅程
        </Link>

        <h1 className="mt-6 text-4xl font-bold">
          🚆 交通
        </h1>

        {!readonly && (

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

        )}

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
                readonly={readonly}
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

      {!readonly && showModal && (

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