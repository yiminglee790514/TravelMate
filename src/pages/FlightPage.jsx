import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";

import FlightCard from "../components/flight/FlightCard";
import FlightModal from "../components/flight/FlightModal";

export default function FlightPage() {

  const { id, shareId } = useParams();

  const readonly = !!shareId;

  const {
    trip: cloudTrip,
    updateTrip,
  } = useTrip(id);

  const [trip, setTrip] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [flightType, setFlightType] = useState("outbound");

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

  async function saveFlight(flight) {

    const updatedTrip = {

      ...trip,

      flights: trip.flights || {

        outbound: null,

        inbound: null,

      },

    };

    updatedTrip.flights[flightType] = flight;

    if (readonly) {

      setTrip(updatedTrip);

      return;

    }

    await updateTrip(updatedTrip);

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
          ← 回旅程
        </Link>

        <h1 className="mt-6 text-4xl font-bold">

          ✈️ 航班

        </h1>

        <div className="mt-8 space-y-6">

          <FlightCard
            title="🛫 去程"
            flight={trip.flights?.outbound}
            readonly={readonly}
            onAdd={() => {

              setFlightType("outbound");

              setShowModal(true);

            }}
            onEdit={() => {

              setFlightType("outbound");

              setShowModal(true);

            }}
          />

          <FlightCard
            title="🛬 回程"
            flight={trip.flights?.inbound}
            readonly={readonly}
            onAdd={() => {

              setFlightType("inbound");

              setShowModal(true);

            }}
            onEdit={() => {

              setFlightType("inbound");

              setShowModal(true);

            }}
          />

        </div>

      </div>

      {!readonly && showModal && (

        <FlightModal
          title={
            flightType === "outbound"
              ? "建立去程航班"
              : "建立回程航班"
          }
          flight={trip.flights?.[flightType]}
          onClose={() => setShowModal(false)}
          onSave={saveFlight}
        />

      )}

    </div>

  );

}