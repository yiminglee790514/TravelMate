import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";

import TransportModal from "../components/TransportModal";
import TransportCard from "../components/TransportCard";

export default function TransportPage() {

  const { id, shareId } = useParams();

  const readonly = !!shareId;

  const {
    trip: cloudTrip,
    updateTrip,
  } = useTrip(id);

  const [trip, setTrip] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [editingTransport, setEditingTransport] = useState(null);

  useEffect(() => {

    async function loadTrip() {

      if (readonly) {

        const data = await getShare(shareId);

        setTrip(data);

      } else {

        setTrip(cloudTrip);

      }

    }

    loadTrip();

  }, [cloudTrip, shareId, readonly]);

  if (!trip) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        載入中...
      </div>
    );

  }

  async function handleSaveTransport(transport) {

    const updatedTransports = [...(trip.transports || [])];

    const index = updatedTransports.findIndex(
      (t) => t.id === transport.id
    );

    if (index === -1) {

      updatedTransports.push(transport);

    } else {

      updatedTransports[index] = transport;

    }

    const updatedTrip = {

      ...trip,

      transports: updatedTransports,

    };

    if (readonly) {

      setTrip(updatedTrip);

      return;

    }

    await updateTrip(updatedTrip);

    setEditingTransport(null);

    setShowModal(false);

  }

  async function handleDeleteTransport(transportId) {

    if (!confirm("確定刪除此交通？")) return;

    const updatedTrip = {

      ...trip,

      transports: trip.transports.filter(
        (t) => t.id !== transportId
      ),

    };

    if (readonly) {

      setTrip(updatedTrip);

      return;

    }

    await updateTrip(updatedTrip);

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

          {trip.transports?.length === 0 ? (

            <div className="rounded-2xl bg-white p-8 text-center text-gray-400 shadow">

              尚未新增交通

            </div>

          ) : (

            trip.transports?.map((transport) => (

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