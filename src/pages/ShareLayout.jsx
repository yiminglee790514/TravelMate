import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getShare } from "../services/shareService";

const menuItems = [
  { path: "itinerary", icon: "🗓️", title: "行程" },
  { path: "flight", icon: "✈️", title: "航班" },
  { path: "hotel", icon: "🏨", title: "飯店" },
  { path: "transport", icon: "🚆", title: "交通" },
  { path: "weather", icon: "🌤️", title: "天氣" },
  { path: "expense", icon: "💰", title: "花費" },
];

export default function ShareLayout() {
  const { shareId } = useParams();
  const location = useLocation();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    let active = true;
    getShare(shareId).then((data) => {
      if (active) setTrip(data);
    });
    return () => {
      active = false;
    };
  }, [shareId]);

  if (!trip) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-100">載入中...</div>;
  }

  async function handleShare() {
    const url = `${window.location.origin}/share/${shareId}`;
    try {
      await navigator.clipboard.writeText(url);
      alert(`分享連結已複製！\n\n${url}`);
    } catch {
      alert(url);
    }
  }

  function handleMembers() {
    const members = Array.isArray(trip.members) ? trip.members : [];
    const names = members
      .map((member) => typeof member === "string" ? member : member?.name || member?.displayName || member?.email)
      .filter(Boolean);

    alert(names.length ? `成員\n\n${names.join("\n")}` : "目前沒有可顯示的成員資料");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100">
      <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
        <Link to="/" className="text-sm text-blue-500">← 回首頁</Link>

        <h1 className="mt-4 break-words text-3xl font-bold sm:text-4xl">
          {trip.title}
        </h1>

        <div className="mt-4 flex gap-3">
          <button onClick={handleShare} className="flex-1 rounded-xl bg-green-500 py-3 font-semibold text-white">
            🔗 分享
          </button>
          <button onClick={handleMembers} className="flex-1 rounded-xl bg-blue-500 py-3 font-semibold text-white">
            👥 成員
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-500">📍 {trip.country}｜{trip.city}</p>
        <p className="mt-1 text-sm text-gray-500">📅 {trip.startDate} ~ {trip.endDate}</p>
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-2 sm:px-6">
        <Outlet context={{ trip }} />
      </main>

      <nav className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 rounded-3xl border border-gray-200/80 bg-white/95 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.14)] backdrop-blur-md sm:left-1/2 sm:right-auto sm:w-[680px] sm:-translate-x-1/2">
        <div className="grid grid-cols-6 gap-1">
          {menuItems.map((item) => {
            const path = `/share/${shareId}/${item.path}`;
            const active = location.pathname === path || (item.path === "itinerary" && location.pathname === `/share/${shareId}`);

            return (
              <Link
                key={item.path}
                to={path}
                className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-0.5 py-2 text-center transition ${active ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <span className="text-xl leading-none sm:text-2xl">{item.icon}</span>
                <span className="mt-1 whitespace-nowrap text-[10px] font-medium sm:text-xs">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
