import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getShare } from "../services/shareService";

export default function SharePage() {

  const { shareId } = useParams();

  const [trip, setTrip] = useState(null);

  useEffect(() => {

    async function load() {

      const data = await getShare(shareId);

      setTrip(data);

    }

    load();

  }, [shareId]);

  if (!trip) {

    return (

      <div className="min-h-screen flex items-center justify-center">
        載入中...
      </div>

    );

  }

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-md px-6 py-10">

        <h1 className="text-4xl font-bold">
          {trip.title}
        </h1>

        <div className="mt-4 text-gray-500">
          📍 {trip.country}｜{trip.city}
        </div>

        <div className="mt-2 text-gray-500">
          📅 {trip.startDate} ～ {trip.endDate}
        </div>

        <div className="mt-10 space-y-5">

          <Link
            to={`/share/${shareId}/flight`}
            className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-lg hover:bg-gray-50"
          >
            <div className="text-xl font-bold">
              ✈️ 航班
            </div>

            <div className="text-2xl">
              ›
            </div>

          </Link>

          <Link
            to={`/share/${shareId}/hotel`}
            className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-lg hover:bg-gray-50"
          >
            <div className="text-xl font-bold">
              🏨 飯店
            </div>

            <div className="text-2xl">
              ›
            </div>

          </Link>

          <Link
            to={`/share/${shareId}/transport`}
            className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-lg hover:bg-gray-50"
          >
            <div className="text-xl font-bold">
              🚆 交通
            </div>

            <div className="text-2xl">
              ›
            </div>

          </Link>

          <Link
            to={`/share/${shareId}/weather`}
            className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-lg hover:bg-gray-50"
          >
            <div className="text-xl font-bold">
              🌤️ 天氣
            </div>

            <div className="text-2xl">
              ›
            </div>

          </Link>

          <Link
            to={`/share/${shareId}/itinerary`}
            className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-lg hover:bg-gray-50"
          >
            <div className="text-xl font-bold">
              📅 行程表
            </div>

            <div className="text-2xl">
              ›
            </div>

          </Link>

          <Link
            to={`/share/${shareId}/expense`}
            className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-lg hover:bg-gray-50"
          >
            <div className="text-xl font-bold">
              💰 花費
            </div>

            <div className="text-2xl">
              ›
            </div>

          </Link>

        </div>

      </div>

    </div>

  );

}