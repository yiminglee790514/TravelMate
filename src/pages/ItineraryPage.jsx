import TimelineItem from "../components/day/TimelineItem";
import AddItemModal from "../components/day/AddItemModal";
import TripModal from "../components/TripModal";

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
const [editItem, setEditItem] = useState(null);
const [showTripModal, setShowTripModal] = useState(false);
const [currentDay, setCurrentDay] = useState(1);

const [items, setItems] = useState([]);

const [trip, setTrip] = useState(
  tripService.getTrip(id)
);

useEffect(() => {

  setTrip(
    tripService.getTrip(id)
  );

  setItems(
    tripService.getItems(id)
  );

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

 <div>

  <Link
    to={`/trip/${id}`}
    className="text-blue-500"
  >
    ← 回旅程
  </Link>

</div>

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

{items
  .filter((timelineItem) => {
    const itemDay = timelineItem.day ?? 1;
    return itemDay === item.day;
  })
  .sort((a, b) => a.time.localeCompare(b.time))
  .map((timelineItem) => (
<TimelineItem
      key={timelineItem.id}
      time={timelineItem.time}
      title={timelineItem.title}
      icon={timelineItem.icon}
      address={timelineItem.address}
      note={timelineItem.note}
      onEdit={() => {
        setEditItem(timelineItem);
        setCurrentDay(item.day);
        setShowModal(true);
      }}
      onDelete={() => {

        tripService.deleteItem(id, timelineItem.id);

        setItems(
          tripService.getItems(id)
        );

      }}
    />
))}
                      <button
                        onClick={() => {
                            setEditItem(null);
                            setCurrentDay(item.day);
                            setShowModal(true);
                        }}
                        className="mt-4 w-full rounded-xl bg-blue-500 py-3 text-white"
                      >
                        {`＋ 新增 Day ${item.day} 行程`}
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
          day={currentDay}
          item={editItem}
          onClose={() => {
            setEditItem(null);
            setShowModal(false);
          }}
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

            if (editItem) {
              tripService.updateItem(id, newItem);
            } else {
              tripService.addItem(id, newItem);
            }

            setItems(tripService.getItems(id));

            setEditItem(null);
            setShowModal(false);

          }}
        />
      )}

      {showTripModal && (
        <TripModal
          trip={trip}
          onClose={() => setShowTripModal(false)}
          onSave={(updatedTrip) => {

            tripService.updateTrip(updatedTrip);

            setTrip(
              tripService.getTrip(id)
            );

            setShowTripModal(false);

          }}
        />
      )}

    </div>

  );
}