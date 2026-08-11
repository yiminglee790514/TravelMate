import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";
import { canEdit } from "../services/permissionService";
import FlightCard from "../components/flight/FlightCard";
import FlightModal from "../components/flight/FlightModal";
import { syncAutoItineraryItems } from "../services/itinerarySync";

function normalizeFlights(flights) {
  if (Array.isArray(flights)) return [...flights];
  return flights ? [flights] : [];
}

export default function FlightPage() {
  const { id, shareId } = useParams();
  const { trip: cloudTrip, updateTrip } = useTrip(id);
  const [trip, setTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [flightType, setFlightType] = useState("outbound");
  const [editingFlight, setEditingFlight] = useState(null);

  const readonly = !!shareId || (trip ? !canEdit(trip) : true);

  useEffect(() => {
    async function loadTrip() {
      if (shareId) {
        setTrip(await getShare(shareId));
      } else {
        setTrip(cloudTrip);
      }
    }
    loadTrip();
  }, [cloudTrip, shareId]);

  if (!trip) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        載入中...
      </div>
    );
  }

  const outbound = normalizeFlights(trip.flights?.outbound);
  const inbound = normalizeFlights(trip.flights?.inbound);
  const activeFlights = flightType === "outbound" ? outbound : inbound;

  const people = Array.isArray(trip.expensePeople) ? trip.expensePeople : [];

  async function saveTrip(nextTrip) {
    nextTrip.items = syncAutoItineraryItems(nextTrip);
    if (!shareId) await updateTrip(nextTrip);
    setTrip(nextTrip);
  }

  async function saveFlight(flight) {
    const flights = {
      outbound: normalizeFlights(trip.flights?.outbound),
      inbound: normalizeFlights(trip.flights?.inbound),
    };

    const list = flights[flightType];
    const index = list.findIndex((item) => item.id === flight.id);

    if (index >= 0) list[index] = flight;
    else list.push(flight);

    await saveTrip({ ...trip, flights });
    setShowModal(false);
  }

  async function deleteFlight(type, flightId) {
    if (!window.confirm("確定刪除此航班？")) return;

    const flights = {
      outbound: normalizeFlights(trip.flights?.outbound),
      inbound: normalizeFlights(trip.flights?.inbound),
    };

    flights[type] = flights[type].filter((item) => item.id !== flightId);
    await saveTrip({ ...trip, flights });
  }

  async function reorderFlights(newFlights) {
    const flights = {
      outbound: normalizeFlights(trip.flights?.outbound),
      inbound: normalizeFlights(trip.flights?.inbound),
    };
    flights[flightType] = newFlights;
    await saveTrip({ ...trip, flights });
  }

  function openAdd() {
    setEditingFlight(null);
    setShowModal(true);
  }

  function openEdit(flight) {
    setEditingFlight(flight);
    setShowModal(true);
  }

  async function addPerson(name) {
    const cleanName = name.trim();
    if (!cleanName) return;
    if (people.includes(cleanName)) {
      alert("這個名字已經存在");
      return;
    }

    await saveTrip({
      ...trip,
      expensePeople: [...people, cleanName],
    });
  }

  return (
    <div className="bg-gray-100">
      <div className="mx-auto w-full max-w-5xl px-3 pb-3 pt-1 sm:px-5">
        {/* 去程 / 回程切換 */}
        <div className="mb-4 rounded-2xl border border-blue-100 bg-white p-1.5 shadow-sm">
          <div className="grid grid-cols-2 overflow-hidden rounded-xl bg-gray-50">
            <button
              type="button"
              onClick={() => setFlightType("outbound")}
              className={`relative flex items-center justify-center gap-2 px-4 py-3 text-base font-bold transition sm:text-lg ${
                flightType === "outbound"
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:bg-white"
              }`}
            >
              <span className="text-xl">🛫</span>
              去程
              {flightType === "outbound" && (
                <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-blue-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setFlightType("inbound")}
              className={`relative flex items-center justify-center gap-2 px-4 py-3 text-base font-bold transition sm:text-lg ${
                flightType === "inbound"
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:bg-white"
              }`}
            >
              <span className="text-xl">🛬</span>
              回程
              {flightType === "inbound" && (
                <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-blue-500" />
              )}
            </button>
          </div>
        </div>

        <FlightCard
          title={flightType === "outbound" ? "去程" : "回程"}
          flights={activeFlights}
          readonly={readonly}
          onAdd={openAdd}
          onEdit={openEdit}
          onDelete={(flightId) => deleteFlight(flightType, flightId)}
          onReorder={reorderFlights}
        />
      </div>

      {!readonly && showModal && (
        <FlightModal
          title={
            editingFlight
              ? flightType === "outbound"
                ? "修改去程航班"
                : "修改回程航班"
              : flightType === "outbound"
                ? "新增去程航班"
                : "新增回程航班"
          }
          flight={editingFlight}
          people={people}
          onClose={() => setShowModal(false)}
          onSave={saveFlight}
          onAddPerson={addPerson}
        />
      )}
    </div>
  );
}
