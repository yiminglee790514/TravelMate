import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";

export default function SortableFlightCard({
  segment,
  index,
  readonly,
  onEdit,
  onDelete,
}) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: segment.id || `flight-${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // =========================
  // 更多選單
  // =========================

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // 旅客資訊預設關閉，點擊後才展開
  const [showPassengers, setShowPassengers] = useState(false);

  const passengers = Array.isArray(segment.passengers)
    ? segment.passengers
    : [];

  // 點其他地方 → 關閉選單
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

  // 航班日期格式
  function formatFlightDate(date) {

    if (!date) return "未設定日期";

    const d = new Date(`${date}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
      return "未設定日期";
    }

    const weekdays = [
      "週日",
      "週一",
      "週二",
      "週三",
      "週四",
      "週五",
      "週六",
    ];

    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
  }

  return (

    <div
      ref={setNodeRef}
      style={style}
      className="mb-6 rounded-2xl border bg-white p-5 shadow-sm"
    >

      {/* =========================
          標題
      ========================= */}

      <div className="mb-3 flex items-center justify-between">

        <div
          className="flex cursor-grab items-center gap-2 text-lg font-bold"
          {...attributes}
          {...listeners}
        >
          ☰ 第 {index + 1} 段
        </div>


        {!readonly && (

          <div
            ref={menuRef}
            className="relative"
          >

            {/* ... 按鈕 */}

            <button
              type="button"
              onClick={(event) => {

                event.stopPropagation();

                setShowMenu((value) => !value);

              }}
              className="
                rounded-lg
                px-2
                py-1
                text-xl
                leading-none
                text-gray-500
                hover:bg-gray-100
              "
              title="更多"
            >
              ⋯
            </button>


            {/* =========================
                下拉選單
            ========================= */}

            {showMenu && (

              <div
                className="
                  absolute
                  right-0
                  top-full
                  z-50
                  mt-1
                  w-28
                  overflow-hidden
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  shadow-lg
                "
              >

                {/* 編輯 */}

                <button
                  type="button"
                  onClick={(event) => {

                    event.stopPropagation();

                    setShowMenu(false);

                    onEdit(segment);

                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-2
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    text-gray-700
                    hover:bg-blue-50
                  "
                >
                  ✏️
                  <span>編輯</span>
                </button>


                {/* 刪除 */}

                <button
                  type="button"
                  onClick={(event) => {

                    event.stopPropagation();

                    setShowMenu(false);

                    onDelete(segment.id);

                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-2
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    text-red-600
                    hover:bg-red-50
                  "
                >
                  🗑️
                  <span>刪除</span>
                </button>

              </div>

            )}

          </div>

        )}

      </div>


      {/* =========================
          航班日期
      ========================= */}

      <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3">

        <span className="text-lg">
          📅
        </span>

        <span className="font-semibold text-blue-700">
          {formatFlightDate(segment.date)}
        </span>

      </div>


      {/* =========================
          航空公司 / 航班號
      ========================= */}

      <div className="mb-3 flex items-start justify-between">

        <div>

          <div className="text-lg font-bold">
            ✈️ {segment.airline}
          </div>

        </div>

        <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600">
          {segment.flightNo}
        </div>

      </div>


      {/* =========================
          出發 / 抵達
      ========================= */}

      <div className="flex items-center justify-between">

        <div className="text-center">

          <div className="text-3xl font-bold">
            {segment.departure?.time || "--"}
          </div>

          <div className="mt-2 text-xl font-bold">
            {segment.departure?.code || "--"}
          </div>

          <div className="mt-1 text-sm text-gray-500">
            {segment.departure?.name || "--"}
          </div>

        </div>

        <div className="px-4 text-2xl text-blue-500">
          ✈️
        </div>

        <div className="text-center">

          <div className="text-3xl font-bold">
            {segment.arrival?.time || "--"}
          </div>

          <div className="mt-2 text-xl font-bold">
            {segment.arrival?.code || "--"}
          </div>

          <div className="mt-1 text-sm text-gray-500">
            {segment.arrival?.name || "--"}
          </div>

        </div>

      </div>


      {/* =========================
          旅客資訊
          預設關閉，點擊後展開
      ========================= */}

      <button
        type="button"
        onClick={() =>
          setShowPassengers((value) => !value)
        }
        className="
          mt-5
          flex
          w-full
          items-center
          justify-between
          rounded-xl
          border
          bg-gray-50
          px-4
          py-3
          text-left
          transition
          hover:bg-gray-100
        "
      >

        <span className="text-sm font-semibold text-gray-700">
          👥 旅客資訊

          {passengers.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              {passengers.length} 人
            </span>
          )}
        </span>

        <span className="text-sm text-gray-400">
          {showPassengers ? "▲" : "▼"}
        </span>

      </button>

      {showPassengers && (

        <div className="
          mt-2
          overflow-hidden
          rounded-xl
          border
          bg-white
        ">

          {passengers.length === 0 ? (

            <div className="
              px-4
              py-4
              text-center
              text-sm
              text-gray-400
            ">
              尚未新增旅客
            </div>

          ) : (

            passengers.map((passenger, passengerIndex) => (

              <div
                key={
                  passenger.id ||
                  `${passenger.name}-${passengerIndex}`
                }
                className="
                  flex
                  min-w-0
                  items-center
                  justify-between
                  gap-3
                  border-b
                  border-gray-100
                  px-4
                  py-3
                  last:border-b-0
                "
              >

                <div className="
                  min-w-0
                  truncate
                  text-sm
                  font-semibold
                  text-gray-800
                ">
                  👤 {passenger.name || "未設定姓名"}
                </div>

                <div className="
                  shrink-0
                  whitespace-nowrap
                  text-sm
                  text-gray-600
                ">
                  🧳 {passenger.baggage ?? 0} 公斤
                </div>

              </div>

            ))

          )}

        </div>

      )}

    </div>

  );
}