import TimelineItem from "../components/day/TimelineItem";
import { useState } from "react";
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

  const trip = tripService.getTrip(id);

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

                      <TimelineItem
                        time="09:00"
                        title="桃園機場"
                        icon="✈️"
                      />

                      <TimelineItem
                        time="11:30"
                        title="香港"
                        icon="🛬"
                      />

                      <TimelineItem
                        time="15:00"
                        title="飯店"
                        icon="🏨"
                      />

                      <button className="mt-4 w-full rounded-xl bg-blue-500 py-3 text-white">
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

    </div>
  );
}