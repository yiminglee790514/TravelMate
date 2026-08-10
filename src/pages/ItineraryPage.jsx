import TimelineItem from "../components/day/TimelineItem";
import AddItemModal from "../components/day/AddItemModal";
import TripModal from "../components/TripModal";

import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";
import { syncAutoItineraryItems } from "../services/itinerarySync";

import {
  canEdit,
  isOwner,
} from "../services/permissionService";




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

  const { id, shareId } = useParams();

  const navigate = useNavigate();

  const {

    trip: cloudTrip,

    updateTrip,

  } = useTrip(id);

  const owner = cloudTrip
    ? isOwner(cloudTrip)
    : false;

  const editable = cloudTrip
    ? canEdit(cloudTrip)
    : false;

  // 分享頁一定唯讀
  // 一般旅程等待 cloudTrip 載入後再判斷
  const readonly = shareId
    ? true
    : (cloudTrip ? !editable : false);

  const [openDay, setOpenDay] = useState(0);

  const [showModal, setShowModal] = useState(false);

  const [editItem, setEditItem] = useState(null);

  const [showTripModal, setShowTripModal] = useState(false);

  const [currentDay, setCurrentDay] = useState(1);

  // AI 規劃第一版
  const [showAIPlanner, setShowAIPlanner] = useState(false);
  const [aiDate, setAiDate] = useState("");
  const [aiStartTime, setAiStartTime] = useState("09:00");
  const [aiEndTime, setAiEndTime] = useState("21:00");
  const [aiTransport, setAiTransport] = useState("不限／混合");

  const [trip, setTrip] = useState(null);

  const [items, setItems] = useState([]);

  const initialized = useRef(false);

  const days = trip
  ? getDays(trip.startDate, trip.endDate)
  : [];

  useEffect(() => {
    
    async function loadTrip() {

      // 分享模式
      if (shareId) {

        const data = await getShare(shareId);

        if (!data) return;

        if (!data.items) {

          data.items = [];

        }

        setTrip(data);

        setItems(data.items);

        return;

      }

      // 一般旅程
      if (!cloudTrip) return;

      // 重新整理自動連動資料，讓舊版重複的飯店資料也能自動修正。
      // 同一住宿群組只保留 1 筆 auto item，跨住宿日期時由畫面重複顯示。
      const t = {

        ...cloudTrip,

      };

      const syncedItems =
        syncAutoItineraryItems(t);

      t.items = syncedItems;

      setTrip(t);
      setItems(syncedItems);

      const oldItems = Array.isArray(cloudTrip.items)
        ? cloudTrip.items
        : [];

      // 把雲端舊版重複資料整理掉。
      if (JSON.stringify(oldItems) !== JSON.stringify(syncedItems)) {
        try {
          await updateTrip(t);
        } catch (error) {
          console.error("同步行程表失敗", error);
        }
      }

    }

    loadTrip();

  }, [cloudTrip, shareId]);

useEffect(() => {

  if (!trip || days.length === 0) return;

  // 已經初始化過就不要再自動展開
  if (initialized.current) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let targetDay = days[0].day;

  for (const d of days) {

    const date = new Date(d.date);

    if (date >= today) {

      targetDay = d.day;
      break;

    }

    targetDay = d.day;

  }

  setOpenDay(targetDay);

  initialized.current = true;

}, [trip, days, initialized]);

  function openAIPlanner() {
    const defaultDate = trip?.startDate || days[0]?.date || "";
    setAiDate(defaultDate);
    setAiStartTime("09:00");
    setAiEndTime("21:00");
    setAiTransport("不限／混合");
    setShowAIPlanner(true);
  }

  const aiDay = days.find((d) => d.date === aiDate);
  const aiDayItems = aiDay
    ? items
        .filter((item) => (item.day ?? 1) === aiDay.day)
        .sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")))
    : [];

  if (!trip) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <h1 className="text-3xl font-bold">

          載入中...

        </h1>

      </div>

    );

  }

    return (

    <>

      {!readonly && (
        <button
          type="button"
          aria-label="AI 規劃行程"
          title="AI 規劃行程"
          onClick={openAIPlanner}
          className="fixed right-4 top-4 z-[120] flex h-14 w-14 items-center justify-center rounded-full bg-white p-1.5 shadow-lg ring-1 ring-gray-200 transition hover:scale-105 hover:shadow-xl active:scale-95 sm:right-6 sm:top-6 sm:h-16 sm:w-16"
        >
          <img
            src="/ai-robot.svg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-contain"
          />
        </button>
      )}

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

                  <div className="flex items-center gap-3">

                      {(() => {

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const date = new Date(item.date);
                        date.setHours(0, 0, 0, 0);

                        const isToday = today.getTime() === date.getTime();

                        const week = ["日", "一", "二", "三", "四", "五", "六"];

                        const text =
                          `Day ${item.day}　${date.getMonth() + 1}/${date.getDate()}（週${week[date.getDay()]}）`;

                        return (
                          <>

                            <span
                              className={`h-3 w-3 rounded-full ${
                                isToday
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />

                            <span className="text-xl font-bold">

                              {text}

                            </span>

                            {isToday && (

                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                今天
                              </span>

                            )}

                          </>
                        );

                      })()}

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
                          // 飯店同步時已經為每一個住宿日建立唯一的一筆資料，
                          // 這裡直接依 Day 篩選即可。
                          const itemDay = timelineItem.day ?? 1;
                          return itemDay === item.day;
                        })
                        .sort((a, b) =>
                          a.time.localeCompare(b.time)
                        )
                        .map((timelineItem) => (

                          <TimelineItem
                            key={timelineItem.id}
                            item={timelineItem}
                            readonly={readonly || !!timelineItem.autoSource}
                            owner={owner}

                            onClick={
                              timelineItem.type === "hotel"
                                ? () => {

                                    if (shareId) {

                                      navigate(`/share/${shareId}/hotel`);

                                    } else {

                                      navigate(`/trip/${id}/hotel`);

                                    }

                                  }
                                : timelineItem.type === "flight"
                                  ? () => {

                                      if (shareId) {

                                        navigate(`/share/${shareId}/flight`);

                                      } else {

                                        navigate(`/trip/${id}/flight`);

                                      }

                                    }
                                  : timelineItem.type === "transport"
                                    ? () => {

                                        if (shareId) {

                                          navigate(`/share/${shareId}/transport`);

                                        } else {

                                          navigate(`/trip/${id}/transport`);

                                        }

                                      }
                                    : undefined
                            }

                            onEdit={() => {

                              setEditItem(timelineItem);

                              setCurrentDay(item.day);

                              setShowModal(true);

                            }}
                            onDelete={async () => {

                              if (!owner) return;

                              const updatedItems =
                                items.filter(
                                  (i) =>
                                    i.id !== timelineItem.id
                                );

                              await updateTrip({

                                ...trip,

                                items: updatedItems,

                              });

                              setItems(updatedItems);

                            }}
                          />

                        ))}

                      {!readonly && (

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

                      )}

                    </div>

                  </div>

                )}

              </div>

            );

          })}

        

      </div>

      {!readonly && showAIPlanner && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold">🤖 AI 規劃行程</h2>
                <p className="mt-1 text-sm text-gray-500">選擇條件後，AI 會先讀取這一天已有的行程。</p>
              </div>
              <button type="button" onClick={() => setShowAIPlanner(false)} className="rounded-full px-3 py-1 text-2xl text-gray-400 hover:bg-gray-100">×</button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">📅 日期</label>
                <select
                  value={aiDate}
                  onChange={(e) => setAiDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  {days.map((d) => {
                    const date = new Date(`${d.date}T00:00:00`);
                    const week = ["日", "一", "二", "三", "四", "五", "六"];
                    return (
                      <option key={d.date} value={d.date}>
                        Day {d.day}　{date.getMonth() + 1}/{date.getDate()}（週{week[date.getDay()]}）
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">🕘 開始時間</label>
                  <input type="time" value={aiStartTime} onChange={(e) => setAiStartTime(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">🕘 結束時間</label>
                  <input type="time" value={aiEndTime} onChange={(e) => setAiEndTime(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">🚗 交通方式</label>
                <select value={aiTransport} onChange={(e) => setAiTransport(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500">
                  <option>不限／混合</option>
                  <option>🚗 自駕／租車</option>
                  <option>🚆 大眾運輸</option>
                  <option>🚕 計程車</option>
                  <option>🚶 步行</option>
                </select>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-bold">📋 目前這一天的行程</div>
                  <span className="text-sm text-gray-500">{aiDayItems.length} 筆</span>
                </div>

                {aiDayItems.length === 0 ? (
                  <div className="rounded-xl bg-white px-4 py-5 text-center text-sm text-gray-500">這一天目前沒有行程，AI 可以從空白開始規劃。</div>
                ) : (
                  <div className="space-y-2">
                    {aiDayItems.map((item) => (
                      <div key={item.id} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span>{item.icon || "📍"}</span>
                          <span className="font-semibold">{item.time || "--:--"}</span>
                          <span>{item.title || item.name || "未命名行程"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-800">
                <div className="font-bold">AI 第一版</div>
                <div className="mt-1">目前先完成「選日期、時間、交通 → 讀取該日行程」；按下開始後，下一版再接真正的 AI 規劃。</div>
              </div>

              <button type="button" onClick={() => alert(`AI 規劃條件\n日期：${aiDate}\n時間：${aiStartTime}～${aiEndTime}\n交通：${aiTransport}\n既有行程：${aiDayItems.length} 筆`)} className="w-full rounded-2xl bg-blue-500 py-4 font-bold text-white shadow-md hover:bg-blue-600">
                🤖 開始 AI 規劃
              </button>
            </div>
          </div>
        </div>
      )}

      {!readonly && showModal && (

        <AddItemModal
          day={currentDay}
          item={editItem}
          onClose={() => {

            setEditItem(null);

            setShowModal(false);

          }}
          onSave={async (item) => {

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

            let updatedItems;

            if (editItem) {

              updatedItems = items.map((i) =>

                i.id === newItem.id
                  ? newItem
                  : i

              );

            } else {

              updatedItems = [

                ...items,

                newItem,

              ];

            }

            await updateTrip({

              ...trip,

              items: updatedItems,

            });

            setItems(updatedItems);

            setEditItem(null);

            setShowModal(false);

          }}
        />

      )}

      {!readonly && showTripModal && (

        <TripModal
          trip={trip}
          onClose={() => setShowTripModal(false)}
          onSave={async (updatedTrip) => {

            await updateTrip(updatedTrip);

            setTrip(updatedTrip);

            setShowTripModal(false);

          }}
        />

      )}

    </>

  );

}