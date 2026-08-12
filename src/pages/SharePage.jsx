import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getShare } from "../services/shareService";

const menuItems = [
  ["flight", "✈️", "航班"],
  ["hotel", "🏨", "飯店"],
  ["transport", "🚆", "交通"],
  ["weather", "🌤️", "天氣"],
  ["itinerary", "📅", "行程表"],
  ["expense", "💰", "花費"],
  ["packing", "🧳", "行李"],
  ["data", "📁", "資料"],
];

export default function SharePage() {
  const { shareId } = useParams();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const data = await getShare(shareId);
      if (active) setTrip(data);
    }

    load();

    return () => {
      active = false;
    };
  }, [shareId]);

  if (!trip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        載入中...
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        <h1 className="break-words text-4xl font-bold sm:text-5xl">
          {trip.title}
        </h1>

        <div className="mt-4 space-y-2 text-sm text-gray-500 sm:text-base">
          <div>📍 {trip.country}｜{trip.city}</div>
          <div>📅 {trip.startDate} ~ {trip.endDate}</div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map(([path, icon, title]) => (
            <Link
              key={path}
              to={`/share/${shareId}/${path}`}
              className="flex min-h-[100px] items-center justify-between rounded-3xl bg-white px-7 py-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-2xl font-bold sm:text-3xl">
                {icon} {title}
              </span>
              <span className="text-3xl text-gray-700">›</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
