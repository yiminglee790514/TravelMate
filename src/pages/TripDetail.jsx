import TimelineItem from "../components/day/TimelineItem";
import AddItemModal from "../components/day/AddItemModal";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import tripService from "../services/tripService";

function getDays(startDate, endDate) {
  if (!startDate || !endDate) return [];

  const result = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  let day = 1;

  while (current <= end) {
    result.push({
      day,
      date: current.toISOString().split("T")[0],
    });

    current.setDate(current.getDate() + 1);
    day++;
  }

  return result;
}

export default function TripDetail() {
  const { id } = useParams();

  const [openDay, setOpenDay] = useState(1);
const [showModal, setShowModal] = useState(false);

const [items, setItems] = useState([]);


  const trip = tripService.getTrip(id);

useEffect(() => {
  setItems(tripService.getItems(id));
}, [id]);

if (!trip.items) {
  trip.items = [];
}

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold">
          找不到旅程
        </h1>
      </div>
    );
  }

  const days = getDays(trip.startDate, trip.endDate);

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-md px-6 py-10">

        <Link
          to="/"
          className="text-blue-500"
        >
          ← 回首頁
        </Link>

        <h1 className="mt-6 text-4xl font-bold">
          {trip.title}
        </h1>

        <p className="mt-4 text-gray-500">
          📍 {trip.country}｜{trip.city}
        </p>

        <p className="mt-2 text-gray-500">
          📅 {trip.startDate} ~ {trip.endDate}
        </p>

        <div className="mt-8 space-y-4">

          {days.map((item) => {

            const isOpen = openDay === item.day;

            return (
              <div
                key={item.day}
                className="rounded-2xl bg-white shadow"
              >

                <button
                  onClick={() =>
                    setOpenDay(isOpen ? 0 : item.day)
                  }
                  className="flex w-full items-center justify-between p-5"
                >

                  <div>

                    <div className="text-xl font-bold">
                      Day {item.day}
                    </div>

                    <div className="mt-1 text-sm text-gray-500">
                      {item.date}
                    </div>

                  </div>

                  <div className="text-2xl">

                    {isOpen ? "▼" : "▶"}

                  </div>

                </button>

                {isOpen && (

                  <div className="border-t p-5">

                    <div className="space-y-2">

{items.map((item) => (
  <TimelineItem
    key={item.id}
    time={item.time}
    title={item.title}
    icon={item.icon}
    onDelete={() => {

      tripService.deleteItem(id, item.id);

      setItems(
        tripService.getItems(id)
      );

    }}
  />
))}
                      <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 w-full rounded-xl bg-blue-500 py-3 text-white"
                      >
                        ＋ 新增行程
                      </button>

                    </div>

                  </div>

                )}

              </div>

            );

          })}

        </div>

      </div>

      {showModal && (
<AddItemModal
  onClose={() => setShowModal(false)}
  onSave={(item) => {

    const iconMap = {
      flight: "✈️",
      hotel: "🏨",
      restaurant: "🍜",
      attraction: "📍",
      shopping: "🛍️",
      transport: "🚆",
    };

const newItem = {
  ...item,
  icon: iconMap[item.type] || "📍",
};

tripService.addItem(id, newItem);

setItems(tripService.getItems(id));

setShowModal(false);
  }}
/>
      )}

    </div>

  );
}