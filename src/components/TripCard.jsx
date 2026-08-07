import { Link } from "react-router-dom";
import { isOwner } from "../services/permissionService";

function getTripStatus(startDate, endDate) {

  if (!startDate || !endDate) return "📅 尚未設定日期";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  const end = new Date(endDate);

  const oneDay = 1000 * 60 * 60 * 24;

  if (today < start) {

    const days = Math.ceil((start - today) / oneDay);

    return `⏳ 還有 ${days} 天`;

  }

  if (today > end) {

    return "✅ 已完成";

  }

  const day = Math.floor((today - start) / oneDay) + 1;

  const total = Math.floor((end - start) / oneDay) + 1;

  return `✈️ Day ${day} / Day ${total}`;

}

function formatDate(date) {

  if (!date) return "----/--/--";

  return date.replaceAll("-", "/");

}

function getFlag(country) {

  const flags = {
    日本: "🇯🇵",
    韓國: "🇰🇷",
    香港: "🇭🇰",
    台灣: "🇹🇼",
    泰國: "🇹🇭",
    美國: "🇺🇸",
    新加坡: "🇸🇬",
    越南: "🇻🇳",
    法國: "🇫🇷",
    英國: "🇬🇧",
  };

  return flags[country] || "🌍";

}

export default function TripCard({
  trip,
  onDelete,
  onEdit,
}) {

  const itemCount = trip.items?.length || 0;

  const owner = isOwner(trip);

  return (

    <Link to={`/trip/${trip.id}`}>

      <div className="relative mt-6 rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {owner && (

  <div className="absolute right-5 top-5 flex gap-1">

    <button
      onClick={(e) => {

        e.preventDefault();
        e.stopPropagation();

        onEdit(trip);

      }}
      className="rounded-xl p-2 text-lg transition hover:bg-blue-100"
      title="修改旅程"
    >
      ✏️
    </button>

    <button
      onClick={(e) => {

        e.preventDefault();
        e.stopPropagation();

        if (window.confirm(`確定要刪除「${trip.title}」嗎？`)) {

          onDelete(trip.id);

        }

      }}
      className="rounded-xl p-2 text-lg transition hover:bg-red-100"
      title="刪除旅程"
    >
      🗑️
    </button>

  </div>

)}

        <div className="flex items-start justify-between">

          <div>

            <h2 className="text-2xl font-bold text-gray-900">

              {getFlag(trip.country)} {trip.title}

            </h2>

            <p className="mt-2 text-gray-500">

              {trip.city} · {trip.country}

            </p>

          </div>

          <div className="text-2xl text-gray-300">

            ›

          </div>

        </div>

        <div className="mt-5 rounded-2xl bg-gray-50 p-4">

          <div className="text-sm text-gray-500">

            📅 {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}

          </div>

          <div className="mt-3 flex items-center justify-between">

            <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">

              {getTripStatus(trip.startDate, trip.endDate)}

            </div>

            <div className="text-sm text-gray-500">

              📋 {itemCount} 個行程

            </div>

          </div>

        </div>

      </div>

    </Link>

  );

}