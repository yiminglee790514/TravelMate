import { Link } from "react-router-dom";
import { isOwner } from "../services/permissionService";
import { useEffect, useRef, useState } from "react";

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
  onCopy,
}) {

  const itemCount = trip.items?.length || 0;

  const owner = isOwner(trip);

  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);


  // =========================
  // 點其他地方 → 收起
  // =========================

  useEffect(() => {

    function handleClickOutside(event) {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }

    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  return (

    <Link to={`/trip/${trip.id}`}>

      <div className="
        relative
        mt-6
        rounded-3xl
        bg-white
        p-6
        shadow-md
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      ">

        {/* =========================
            右上角更多
        ========================= */}

        {owner && (

          <div
            ref={menuRef}
            className="absolute right-4 top-4"
          >

            {/* ⋯ */}

            <button
              type="button"
              onClick={(e) => {

                e.preventDefault();
                e.stopPropagation();

                setShowMenu((prev) => !prev);

              }}
              className="
                rounded-lg
                px-2
                py-1
                text-xl
                font-bold
                leading-none
                text-gray-500
                hover:bg-gray-100
              "
              title="更多"
            >
              ⋯
            </button>


            {/* =========================
                選單
            ========================= */}

            {showMenu && (

              <div className="
                absolute
                right-0
                top-full
                z-50
                mt-1
                w-28
                overflow-hidden
                rounded-xl
                bg-white
                shadow-xl
                ring-1
                ring-black/5
              ">

                {/* 編輯 */}

                <button
                  type="button"
                  onClick={(e) => {

                    e.preventDefault();
                    e.stopPropagation();

                    setShowMenu(false);

                    onEdit(trip);

                  }}
                  className="
                    w-full
                    px-4
                    py-3
                    text-left
                    text-sm
                    hover:bg-blue-50
                  "
                >
                  ✏️ 編輯
                </button>


                {/* 複製 */}

                <button
                  type="button"
                  onClick={(e) => {

                    e.preventDefault();
                    e.stopPropagation();

                    setShowMenu(false);
                    onCopy?.(trip);

                  }}
                  className="
                    w-full
                    px-4
                    py-3
                    text-left
                    text-sm
                    hover:bg-blue-50
                  "
                >
                  📋 複製
                </button>


                {/* 刪除 */}

                <button
                  type="button"
                  onClick={(e) => {

                    e.preventDefault();
                    e.stopPropagation();

                    setShowMenu(false);

                    if (
                      window.confirm(
                        `確定要刪除「${trip.title}」嗎？`
                      )
                    ) {

                      onDelete(trip.id);

                    }

                  }}
                  className="
                    w-full
                    px-4
                    py-3
                    text-left
                    text-sm
                    text-red-600
                    hover:bg-red-50
                  "
                >
                  🗑️ 刪除
                </button>

              </div>

            )}

          </div>

        )}


        {/* =========================
            旅程資訊
        ========================= */}

        <div className="flex items-start justify-between">

          <div>

            <h2 className="text-2xl font-bold text-gray-900">

              {getFlag(trip.country)} {trip.title}

            </h2>

            <p className="mt-2 text-gray-500">

              {trip.city} · {trip.country}

            </p>

          </div>

        </div>


        {/* 日期 / 狀態 */}

        <div className="mt-5 rounded-2xl bg-gray-50 p-4">

          <div className="text-sm text-gray-500">

            📅 {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}

          </div>

          <div className="mt-3 flex items-center justify-between">

            <div className="
              rounded-full
              bg-blue-100
              px-3
              py-1
              text-sm
              font-semibold
              text-blue-700
            ">

              {getTripStatus(
                trip.startDate,
                trip.endDate
              )}

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