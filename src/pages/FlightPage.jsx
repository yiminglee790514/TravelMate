import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";

import { canEdit } from "../services/permissionService";

import FlightCard from "../components/flight/FlightCard";
import FlightModal from "../components/flight/FlightModal";

export default function FlightPage() {

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

  const [flightType, setFlightType] = useState("outbound");

  const [editingFlight, setEditingFlight] = useState(null);

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

  async function saveFlight(flight) {

    const flights = {

      outbound: Array.isArray(trip.flights?.outbound)
        ? [...trip.flights.outbound]
        : trip.flights?.outbound
          ? [trip.flights.outbound]
          : [],

      inbound: Array.isArray(trip.flights?.inbound)
        ? [...trip.flights.inbound]
        : trip.flights?.inbound
          ? [trip.flights.inbound]
          : [],

    };

    const list = flights[flightType];

    const index = list.findIndex(
      (item) => item.id === flight.id
    );

    if (index >= 0) {

      list[index] = flight;

    } else {

      list.push(flight);

    }

    const updatedTrip = {

      ...trip,

      flights,

    };

    if (!shareId) {

      await updateTrip(updatedTrip);

    }

    setTrip(updatedTrip);

    setShowModal(false);

  }

  async function deleteFlight(type, flightId) {

    if (!window.confirm("確定刪除此航班？")) return;

    const flights = {

      outbound: Array.isArray(trip.flights?.outbound)
        ? [...trip.flights.outbound]
        : trip.flights?.outbound
          ? [trip.flights.outbound]
          : [],

      inbound: Array.isArray(trip.flights?.inbound)
        ? [...trip.flights.inbound]
        : trip.flights?.inbound
          ? [trip.flights.inbound]
          : [],

    };

    flights[type] = flights[type].filter(
      (item) => item.id !== flightId
    );

    const updatedTrip = {

      ...trip,

      flights,

    };

    if (!shareId) {

      await updateTrip(updatedTrip);

    }

    setTrip(updatedTrip);

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

          {/* =========================
              去程
          ========================= */}

          <FlightCard
            title="🛫 去程"
            flights={trip.flights?.outbound || []}
            readonly={readonly}

            onAdd={() => {

              setEditingFlight(null);

              setFlightType("outbound");

              setShowModal(true);

            }}

            onEdit={(flight) => {

              setEditingFlight(flight);

              setFlightType("outbound");

              setShowModal(true);

            }}

            onDelete={(flightId) => {

              deleteFlight("outbound", flightId);

            }}

            onReorder={async (newFlights) => {

              const updatedTrip = {

                ...trip,

                flights: {

                  ...(trip.flights || {}),

                  outbound: newFlights,

                },

              };

              if (!shareId) {

                await updateTrip(updatedTrip);

              }

              setTrip(updatedTrip);

            }}

          />

          {/* =========================
              回程
          ========================= */}

          <FlightCard
            title="🛬 回程"
            flights={trip.flights?.inbound || []}
            readonly={readonly}

            onAdd={() => {

              setEditingFlight(null);

              setFlightType("inbound");

              setShowModal(true);

            }}

            onEdit={(flight) => {

              setEditingFlight(flight);

              setFlightType("inbound");

              setShowModal(true);

            }}

            onDelete={(flightId) => {

              deleteFlight("inbound", flightId);

            }}

            onReorder={async (newFlights) => {

              const updatedTrip = {

                ...trip,

                flights: {

                  ...(trip.flights || {}),

                  inbound: newFlights,

                },

              };

              if (!shareId) {

                await updateTrip(updatedTrip);

              }

              setTrip(updatedTrip);

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

          flight={editingFlight}

          onClose={() => setShowModal(false)}

          onSave={saveFlight}

        />

      )}

    </div>

  );

}