import TimelineItem from "../components/day/TimelineItem";
import AddItemModal from "../components/day/AddItemModal";
import TripModal from "../components/TripModal";

import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";

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

      const t = {

        ...cloudTrip,

      };

      if (!t.items) {

        t.items = [];

      }

      setTrip(t);

      setItems(t.items);

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

      <div className="mx-auto max-w-md px-6 py-10">

        <Link
          to={
            readonly
              ? `/share/${shareId}`
              : `/trip/${id}`
          }
          className="text-blue-500"
        >
          ← 回旅程
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

                  <div className="flex items-center gap-3">

                      {(() => {

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const date = new Date(item.date);
                        date.setHours(0, 0, 0, 0);

                        const isToday = today.getTime() === date.getTime();

                        const week = ["日", "一", "二", "三", "四", "五", "六"];

                        const text =
                          `${date.getMonth() + 1}/${date.getDate()}（週${week[date.getDay()]}）`;

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

                          const itemDay =
                            timelineItem.day ?? 1;

                          return itemDay === item.day;

                        })
                        .sort((a, b) =>
                          a.time.localeCompare(b.time)
                        )
                        .map((timelineItem) => (

                          <TimelineItem
                            key={timelineItem.id}
                            item={timelineItem}
                            readonly={readonly}
                            owner={owner}
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

      </div>

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