import { Link, useParams } from "react-router-dom";
import { useState } from "react";

import tripService from "../services/tripService";

import FlightCard from "../components/flight/FlightCard";
import FlightModal from "../components/flight/FlightModal";

export default function FlightPage() {

  const { id } = useParams();

  const [trip, setTrip] = useState(
    tripService.getTrip(id)
  );

  const [showModal, setShowModal] = useState(false);

  const [flightType, setFlightType] = useState("outbound");

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        找不到旅程
      </div>
    );
  }

  function saveFlight(flight) {

    const updatedTrip = {

      ...trip,

      flights: trip.flights || {
        outbound: null,
        inbound: null,
      }

    };

    updatedTrip.flights[flightType] = flight;

    tripService.updateTrip(updatedTrip);

    setTrip(
      tripService.getTrip(id)
    );
  }

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-md px-6 py-10">

        <Link
          to={`/trip/${id}`}
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

      {showModal && (

        <FlightModal

          title={
            flightType === "outbound"
              ? "建立去程航班"
              : "建立回程航班"
          }

          flight={
            trip.flights?.[flightType]
          }

          onClose={() => setShowModal(false)}

          onSave={saveFlight}

        />

      )}

    </div>

  );

}