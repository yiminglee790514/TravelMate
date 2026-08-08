import { useEffect, useRef, useState } from "react";

export default function TimelineItem({
  item,
  time,
  title,
  icon,
  address,
  note,
  onEdit,
  onDelete,
  onClick,
  readonly = false,
  owner = false,
}) {

  // 支援兩種傳法
  if (item) {

    time = item.time;
    title = item.title;
    icon = item.icon;
    address = item.address;
    note = item.note;

  }


  // =========================
  // 更多選單
  // =========================

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

    <div className="py-3">

      {/* =========================
          第一行：時間 + 操作
      ========================= */}

      <div className="mb-2 flex items-center justify-between">

        <div className="
          text-sm
          font-medium
          text-gray-500
        ">
          {time}
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
                text-lg
                font-bold
                leading-none
                text-gray-400
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


      {/* =========================
          第二行：Timeline + 內容
      ========================= */}

      <div className="flex gap-3">

        {/* Timeline */}

        <div className="flex flex-col items-center">

          <div className="
            mt-1
            h-2.5
            w-2.5
            min-h-2.5
            min-w-2.5
            shrink-0
            rounded-full
            bg-blue-500
          " />

          <div className="
            mt-2
            h-full
            w-[2px]
            bg-gray-200
          " />

        </div>


        {/* 內容 */}

        <div className="min-w-0 flex-1">

          {/* =========================
              標題
          ========================= */}

          {onClick ? (

            <button
              type="button"
              onClick={onClick}
              className="
                block
                max-w-full
                text-left
                text-lg
                font-semibold
                leading-6
                text-gray-900
                hover:text-blue-600
              "
            >
              {icon} {title}
            </button>

          ) : (

            <div className="
              break-words
              text-lg
              font-semibold
              leading-6
              text-gray-900
            ">
              {icon} {title}
            </div>

          )}


          {/* =========================
              地址
          ========================= */}

          {address && (

            <div className="mt-2">

              <div className="
                text-[10px]
                font-semibold
                text-gray-400
              ">
                📍 地址
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  address
                )}`}
                target="_blank"
                rel="noreferrer"
                className="
                  mt-0.5
                  block
                  break-words
                  text-xs
                  leading-5
                  text-blue-600
                  hover:underline
                "
              >
                {address}
              </a>

            </div>

          )}


          {/* =========================
              備註
          ========================= */}

          {note && (

            <div className="mt-2">

              <div className="
                text-[10px]
                font-semibold
                text-gray-400
              ">
                📝 備註
              </div>

              <div className="
                mt-1
                rounded-xl
                bg-yellow-50
                p-2.5
                text-xs
                leading-5
                text-gray-700
              ">
                {note}
              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}