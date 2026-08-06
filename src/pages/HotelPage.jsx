import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import tripService from "../services/tripService";
import { getShare } from "../services/shareService";

import HotelModal from "../components/HotelModal";
import HotelCard from "../components/HotelCard";

export default function HotelPage() {

  const { id, shareId } = useParams();

  const readonly = !!shareId;

  const [trip, setTrip] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [editingHotel, setEditingHotel] = useState(null);

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

  function handleSaveHotel(hotel) {

    const updatedTrip = { ...trip };

    updatedTrip.hotels = [...updatedTrip.hotels];

    const index = updatedTrip.hotels.findIndex(
      (h) => h.id === hotel.id
    );

    if (index === -1) {

      updatedTrip.hotels.push(hotel);

    } else {

      updatedTrip.hotels[index] = hotel;

    }

    tripService.updateTrip(updatedTrip);

    setTrip(updatedTrip);

    setEditingHotel(null);

    setShowModal(false);

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
          🏨 飯店
        </h1>

        {!readonly && (

          <button
            onClick={() => setShowModal(true)}
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
            ＋ 新增飯店
          </button>

        )}

        <div className="mt-8 space-y-4">

          {trip.hotels.length === 0 ? (

            <div className="rounded-2xl bg-white p-8 text-center text-gray-400 shadow">

              尚未新增飯店

            </div>

          ) : (

            trip.hotels.map((hotel) => (

              <HotelCard
                key={hotel.id}
                hotel={hotel}
                readonly={readonly}
                onEdit={() => {

                  setEditingHotel(hotel);

                  setShowModal(true);

                }}
                onDelete={() => {

                  if (!confirm("確定刪除此飯店？")) return;

                  const updatedTrip = { ...trip };

                  updatedTrip.hotels =
                    updatedTrip.hotels.filter(
                      (h) => h.id !== hotel.id
                    );

                  tripService.updateTrip(updatedTrip);

                  setTrip(updatedTrip);

                }}
              />

            ))

          )}

        </div>

      </div>

      {!readonly && showModal && (

        <HotelModal
          hotel={editingHotel}
          onClose={() => {

            setEditingHotel(null);

            setShowModal(false);

          }}
          onSave={handleSaveHotel}
        />

      )}

    </div>

  );

}