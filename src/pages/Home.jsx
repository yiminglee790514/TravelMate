import { useEffect, useState } from "react";

import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import TripModal from "../components/TripModal";
import TripCard from "../components/TripCard";

import {
listenTrips,
createTrip,
updateTrip,
deleteTrip,
} from "../services/tripCloudService";

export default function Home() {

  const [showModal, setShowModal] = useState(false);

  const [editingTrip, setEditingTrip] = useState(null);

  const [copyMode, setCopyMode] = useState(false);

  const [trips, setTrips] = useState([]);

  function sortTrips(list) {

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [...list].sort((a, b) => {

    const aStart = new Date(a.startDate);
    const aEnd = new Date(a.endDate);

    const bStart = new Date(b.startDate);
    const bEnd = new Date(b.endDate);

    const aStatus =
      today < aStart ? 1 :
      today <= aEnd ? 0 : 2;

    const bStatus =
      today < bStart ? 1 :
      today <= bEnd ? 0 : 2;

    // 進行中 > 即將出發 > 已完成
    if (aStatus !== bStatus) {
      return aStatus - bStatus;
    }

    // 進行中
    if (aStatus === 0) {
      return aStart - bStart;
    }

    // 即將出發
    if (aStatus === 1) {
      return aStart - bStart;
    }

    // 已完成（最新完成排前面）
    return bEnd - aEnd;

  });

}

  useEffect(() => {

    const unsubscribe = listenTrips((data) => {

      setTrips(sortTrips(data));

    });

    return unsubscribe;

  }, []);

  function handleCopyTrip(trip) {

    const cloned = JSON.parse(JSON.stringify(trip));

    delete cloned.id;
    delete cloned.owner;
    delete cloned.members;
    delete cloned.memberRoles;
    delete cloned.createdAt;
    delete cloned.updatedAt;

    setEditingTrip(cloned);
    setCopyMode(true);
    setShowModal(true);

  }

  async function handleAddTrip(trip) {

    try {

      await createTrip(trip);

      setShowModal(false);
      setEditingTrip(null);
      setCopyMode(false);

    } catch (err) {

      console.error(err);

      alert(err.message);

    }

  }

async function handleEditTrip(trip) {

  try {

    await updateTrip(
      trip.id,
      trip
    );

    setEditingTrip(null);
    setCopyMode(false);

    setShowModal(false);

  } catch (err) {

    console.error(err);

    alert(err.message);

  }

}

  async function handleDeleteTrip(id) {

    if (!window.confirm("確定要刪除這個旅程嗎？")) return;

    try {

      await deleteTrip(id);

    } catch (err) {

      console.error(err);

      alert(err.message);

    }

  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fbff] via-white to-[#f4f7ff]">
      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-4 sm:max-w-lg sm:px-6">
        <Header />

        <button onClick={() => { setEditingTrip(null); setCopyMode(false); setShowModal(true); }} className="group flex w-full items-center gap-4 rounded-[1.45rem] bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4 text-left text-white shadow-lg shadow-blue-200/50 transition hover:-translate-y-0.5 hover:shadow-xl">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl">✈️</span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-extrabold">建立新旅程</span>
            <span className="mt-0.5 block text-sm text-blue-100">開始規劃您的下一段旅程</span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold text-blue-600 transition group-hover:translate-x-0.5">›</span>
        </button>

        <div className="mb-4 mt-8 flex items-center justify-between px-1">
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-900"><span className="text-2xl">🧳</span> 我的旅程</h2>
          <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">{trips.length} 個旅程</div>
        </div>

        {trips.length === 0 ? <EmptyState /> : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip}
                onEdit={(trip) => { setEditingTrip(trip); setCopyMode(false); setShowModal(true); }}
                onCopy={handleCopyTrip} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TripModal trip={editingTrip} copyMode={copyMode}
          onClose={() => { setEditingTrip(null); setCopyMode(false); setShowModal(false); }}
          onSave={copyMode ? handleAddTrip : (editingTrip ? handleEditTrip : handleAddTrip)} />
      )}
    </div>
  );
}
