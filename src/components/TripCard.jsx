import { Link } from "react-router-dom";

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

export default function TripCard({ trip, onDelete }) {
  return (
    <Link to={`/trip/${trip.id}`}>

      <div className="relative mt-6 rounded-3xl bg-white p-6 shadow-lg transition hover:scale-[1.02] hover:shadow-xl">

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (window.confirm(`確定要刪除「${trip.title}」嗎？`)) {
              onDelete(trip.id);
            }
          }}
          className="absolute right-5 top-5 rounded-lg p-2 text-xl hover:bg-red-100"
          title="刪除旅程"
        >
          🗑️
        </button>

        <h2 className="text-2xl font-bold">
          {trip.title}
        </h2>

        <p className="mt-3 text-gray-500">
          📍 {trip.country}｜{trip.city}
        </p>

        <p className="mt-2 text-gray-500">
          📅 {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}
        </p>

        <div className="mt-5 border-t pt-4 font-semibold text-blue-600">
          {getTripStatus(trip.startDate, trip.endDate)}
        </div>

      </div>

    </Link>
  );
}