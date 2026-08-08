import { useEffect, useRef, useState } from "react";
import PackingItem from "./PackingItem";

export default function PackingGroup({
  group,
  openItemId,
  setOpenItemId,
  onAddItem,
  onEditGroup,
  onDeleteGroup,
  onToggleItem,
  onEditItem,
  onDeleteItem,
}) {

  const items = [...group.items].sort((a, b) => {

    if (a.checked === b.checked) return 0;

    return a.checked ? 1 : -1;

  });


  // =========================
  // 更多選單
  // =========================

  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);


  // 點其他地方 → 收起
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

      {/* =========================
          群組標題
      ========================= */}

      <div className="mb-5 flex items-center justify-between">

        <h2 className="text-xl font-bold">

          {group.icon || "📂"} {group.title}

        </h2>


        {/* =========================
            更多
        ========================= */}

        <div
          ref={menuRef}
          className="relative"
        >

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

                  onEditGroup(group);

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

                  onDeleteGroup(group.id);

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

      </div>


      {/* =========================
          物品
      ========================= */}

      <div className="space-y-2">

        {items.length === 0 ? (

          <div className="text-sm text-gray-400">

            尚未新增物品

          </div>

        ) : (

          items.map((item) => (

            <PackingItem
              key={item.id}
              item={item}
              onToggle={() =>
                onToggleItem(group.id, item.id)
              }
              onEdit={() =>
                onEditItem(group.id, item)
              }
              onDelete={() =>
                onDeleteItem(group.id, item.id)
              }
            />

          ))

        )}

      </div>


      {/* =========================
          新增物品
      ========================= */}

      <button
        onClick={() => onAddItem(group.id)}
        className="
          mt-5
          w-full
          rounded-xl
          bg-blue-500
          py-3
          text-white
          hover:bg-blue-600
        "
      >
        ＋ 新增物品
      </button>

    </div>

  );

}