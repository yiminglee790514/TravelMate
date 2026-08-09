import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";
import { canEdit } from "../services/permissionService";

import TransportModal from "../components/TransportModal";
import TransportCard from "../components/TransportCard";

export default function TransportPage() {

  const { id, shareId } = useParams();

  const {
    trip: cloudTrip,
    updateTrip,
  } = useTrip(id);

  const [trip, setTrip] = useState(null);

  const readonly =
    !!shareId ||
    (trip ? !canEdit(trip) : true);

  const [showModal, setShowModal] = useState(false);

  const [editingTransport, setEditingTransport] = useState(null);


  useEffect(() => {

    async function loadTrip() {

      if (shareId) {

        const data = await getShare(shareId);

        setTrip(data);

      } else {

        setTrip(cloudTrip);

      }

    }

    loadTrip();

  }, [cloudTrip, shareId]);


  if (!trip) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        載入中...

      </div>

    );

  }


  // 與花費頁共用付款人名單
  const people = Array.isArray(trip.expensePeople)
    ? trip.expensePeople
    : [];


  async function handleAddPerson(name) {

    if (readonly) return;

    const cleanName = name.trim();

    if (!cleanName) return;

    if (people.includes(cleanName)) return;

    const updatedTrip = {

      ...trip,

      expensePeople: [
        ...people,
        cleanName,
      ],

    };

    setTrip(updatedTrip);

    await updateTrip(updatedTrip);

  }


  async function handleSaveTransport(transport) {

    const updatedTransports = [
      ...(trip.transports || []),
    ];

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

    if (shareId) return;

    await updateTrip(updatedTrip);

    setTrip(updatedTrip);

    setEditingTransport(null);

    setShowModal(false);

  }


  async function handleDeleteTransport(transportId) {

    if (!window.confirm("確定刪除此交通？")) return;

    if (shareId) return;

    const updatedTrip = {

      ...trip,

      transports: (trip.transports || []).filter(
        (t) => t.id !== transportId
      ),

    };

    await updateTrip(updatedTrip);

    setTrip(updatedTrip);

    setEditingTransport(null);

  }


  return (

    <div className="bg-gray-100">

      <div className="mx-auto w-full max-w-6xl px-4 pt-2 pb-2 sm:px-6">

        {!readonly && (

          <button
            onClick={() => {

              setEditingTransport(null);

              setShowModal(true);

            }}
            className="
              mt-2
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


        <div className="mt-4 space-y-4">

          {trip.transports?.length === 0 ? (

            <div className="
              rounded-2xl
              bg-white
              p-8
              text-center
              text-gray-400
              shadow
            ">
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

                  handleDeleteTransport(
                    transport.id
                  );

                }}
              />

            ))

          )}

        </div>

      </div>


      {!readonly && showModal && (

        <TransportModal
          transport={editingTransport}

          people={people}

          onAddPerson={handleAddPerson}

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
