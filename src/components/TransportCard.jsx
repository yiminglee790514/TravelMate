import { useEffect, useRef, useState } from "react";

export default function TransportCard({
  transport,
  onEdit,
  onDelete,
  readonly = false,
}) {

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);


  // 點其他地方 → 收起選單
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

    <div className="rounded-2xl bg-white p-5 shadow">

      {/* 標題 */}

      <div className="flex items-start justify-between">

        <div>

          <div className="text-xl font-semibold">
            {transport.type}
          </div>

          <div className="mt-1 text-lg font-medium">
            {transport.company}
          </div>

        </div>


        {!readonly && (

          <div
            ref={menuRef}
            className="relative"
          >

            {/* ... */}

            <button
              type="button"
              onClick={(event) => {

                event.stopPropagation();

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


            {/* 選單 */}

            {showMenu && (

              <div className="
                absolute
                right-0
                top-full
                z-40
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
                  onClick={(event) => {

                    event.stopPropagation();

                    setShowMenu(false);

                    onEdit();

                  }}
                  className="
                    w-full
                    px-4
                    py-3
                    text-left
                    text-sm
                    hover:bg-gray-100
                  "
                >
                  ✏️ 編輯
                </button>


                {/* 刪除 */}

                <button
                  type="button"
                  onClick={(event) => {

                    event.stopPropagation();

                    setShowMenu(false);

                    onDelete();

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

      </div>


      {/* 路線 */}

      {(transport.from || transport.to) && (

        <div className="mt-4 text-base font-medium">

          📍 {transport.from} → {transport.to}

        </div>

      )}


      {/* 日期 */}

      {(transport.departureDate || transport.arrivalDate) && (

        <div className="mt-3 text-sm text-gray-600">

          📅 {transport.departureDate}

          {transport.arrivalDate &&
            transport.arrivalDate !== transport.departureDate &&
            ` → ${transport.arrivalDate}`}

        </div>

      )}


      {/* 時間 */}

      {(transport.departureTime || transport.arrivalTime) && (

        <div className="mt-2 rounded-xl bg-slate-50 p-3">

          <div className="flex justify-between text-sm">

            <span>🕒 出發</span>

            <span className="font-medium">
              {transport.departureTime || "--:--"}
            </span>

          </div>


          <div className="mt-2 flex justify-between text-sm">

            <span>🕚 抵達</span>

            <span className="font-medium">
              {transport.arrivalTime || "--:--"}
            </span>

          </div>

        </div>

      )}


      {/* 價格 */}

      {transport.price && (

        <div className="
          mt-4
          text-lg
          font-semibold
          text-emerald-600
        ">

          💰 {Number(transport.price).toLocaleString()}

        </div>

      )}


      {/* 網站 */}

      {transport.website && (

        <a
          href={transport.website}
          target="_blank"
          rel="noreferrer"
          className="
            mt-3
            block
            text-sm
            text-green-600
            hover:underline
          "
        >
          🌐 官方網站
        </a>

      )}


      {/* 備註 */}

      {transport.note && (

        <div className="
          mt-4
          rounded-xl
          bg-yellow-50
          p-3
          text-sm
          text-gray-700
        ">

          📝 {transport.note}

        </div>

      )}

    </div>

  );

}