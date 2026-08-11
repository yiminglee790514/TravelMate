import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";

function moneyText(passenger) {
  if (
    passenger.price === "" ||
    passenger.price === null ||
    passenger.price === undefined
  ) {
    return "未填價格";
  }

  const symbols = {
    TWD: "NT$",
    USD: "$",
    HKD: "HK$",
    KRW: "₩",
    JPY: "¥",
    CNY: "¥",
    EUR: "€",
  };

  return `${symbols[passenger.currency] || passenger.currency || "¥"}${Number(
    passenger.price,
  ).toLocaleString()}`;
}

function passengerDetailText(passenger) {
  const seat = passenger.seat?.trim?.() || "";
  const baggage = passenger.baggageKg ?? "";
  const parts = [];

  if (seat) parts.push(`座位 ${seat}`);
  if (baggage !== "" && baggage !== null && baggage !== undefined) {
    parts.push(`行李 ${baggage} kg`);
  }

  return parts.length ? parts.join("　·　") : "座位／行李未設定";
}

export default function SortableFlightCard({
  segment,
  index,
  readonly,
  onEdit,
  onDelete,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: segment.id || `flight-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [showMenu, setShowMenu] = useState(false);
  const [showPassengers, setShowPassengers] = useState(false);
  const menuRef = useRef(null);

  const passengers = Array.isArray(segment.passengers)
    ? segment.passengers
    : [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function formatFlightDate(date) {
    if (!date) return "未設定日期";

    const d = new Date(`${date}T00:00:00`);
    if (Number.isNaN(d.getTime())) return "未設定日期";

    const weekdays = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="tm-flight-card mb-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
    >
      {/* 段落標題 */}
      <div className="mb-4 flex items-center justify-between">
        <div
          className="flex cursor-grab items-center gap-2 text-lg font-extrabold text-slate-900 active:cursor-grabbing sm:text-xl"
          {...attributes}
          {...listeners}
        >
          <span className="text-base text-slate-700">☰</span>
          第 {index + 1} 段
        </div>

        {!readonly && (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowMenu((value) => !value);
              }}
              className="rounded-xl px-2 py-1 text-xl leading-none text-gray-500 hover:bg-gray-100"
              title="更多"
            >
              ⋯
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-28 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowMenu(false);
                    onEdit(segment);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50"
                >
                  ✏️ <span>編輯</span>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowMenu(false);
                    onDelete(segment.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  🗑️ <span>刪除</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 日期 */}
      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2.5">
        <span className="text-lg">📅</span>
        <span className="text-sm font-extrabold text-blue-700 sm:text-base">
          {formatFlightDate(segment.date)}
        </span>
      </div>

      {/* 航空公司 / 航班號 */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0 text-base font-extrabold text-slate-900 sm:text-lg">
          ✈️ {segment.airline || "未設定航空公司"}
        </div>
        <div className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-extrabold text-blue-600 sm:text-base">
          {segment.flightNo || "--"}
        </div>
      </div>

      {/* 出發 / 抵達 */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-5">
        <div className="min-w-0 text-center">
          <div className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            {segment.departure?.time || "--:--"}
          </div>
          <div className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">
            {segment.departure?.code || "--"}
          </div>
          <div className="mt-1 break-words text-xs font-semibold text-gray-500 sm:text-sm">
            {segment.departure?.name || "--"}
          </div>
        </div>

        <div className="flex min-w-12 items-center justify-center text-xl text-blue-500 sm:text-2xl">
          <span className="hidden h-px w-10 bg-gray-200 sm:block" />
          <span className="mx-1">✈️</span>
          <span className="hidden h-px w-10 bg-gray-200 sm:block" />
        </div>

        <div className="min-w-0 text-center">
          <div className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            {segment.arrival?.time || "--:--"}
          </div>
          <div className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">
            {segment.arrival?.code || "--"}
          </div>
          <div className="mt-1 break-words text-xs font-semibold text-gray-500 sm:text-sm">
            {segment.arrival?.name || "--"}
          </div>
        </div>
      </div>

      {/* 旅客資訊 */}
      <button
        type="button"
        onClick={() => setShowPassengers((value) => !value)}
        className="mt-5 flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-left transition hover:bg-gray-100"
      >
        <span className="text-sm font-bold text-gray-700">
          👥 旅客資訊
          {passengers.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              {passengers.length} 人
            </span>
          )}
        </span>
        <span className="text-xs text-gray-400">
          {showPassengers ? "▲" : "▼"}
        </span>
      </button>

      {showPassengers && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {passengers.length === 0 ? (
            <div className="px-4 py-5 text-center text-sm text-gray-400">
              尚未新增旅客
            </div>
          ) : (
            passengers.map((passenger, passengerIndex) => (
              <div
                key={passenger.id || `${passenger.name}-${passengerIndex}`}
                className="flex min-w-0 items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-extrabold text-slate-800">
                    👤 {passenger.name || "未設定姓名"}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-gray-400">
                    {passengerDetailText(passenger)}
                  </div>
                </div>

                <div className="shrink-0 whitespace-nowrap text-sm font-extrabold text-emerald-600">
                  {moneyText(passenger)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </article>
  );
}
