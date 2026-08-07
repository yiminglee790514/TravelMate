import { useState } from "react";

export default function PackingItem({
  item,
  onToggle,
  onEdit,
  onDelete,
}) {

  const [showMenu, setShowMenu] = useState(false);

  return (

    <div className="relative rounded-xl bg-white">

      <div className="flex items-center gap-3 px-3 py-3">

        <input
          type="checkbox"
          checked={item.checked}
          onChange={onToggle}
          className="h-5 w-5"
        />

        <div
          className={`flex-1 transition ${
            item.checked
              ? "text-gray-400 line-through"
              : "text-gray-800"
          }`}
        >
          {item.name}
        </div>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        >
          ⋯
        </button>

      </div>

      {showMenu && (

        <div className="absolute right-2 top-11 z-50 w-32 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">

          <button
            onClick={() => {

              setShowMenu(false);

              onEdit();

            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <span>✏️</span>
            <span>編輯</span>
          </button>

          <div className="border-t border-gray-100" />

          <button
            onClick={() => {

              setShowMenu(false);

              onDelete();

            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
          >
            <span>🗑️</span>
            <span>刪除</span>
          </button>

        </div>

      )}

    </div>

  );

}