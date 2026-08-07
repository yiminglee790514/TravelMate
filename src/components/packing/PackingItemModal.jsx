import { useState } from "react";

export default function PackingItemModal({
  item,
  onClose,
  onSave,
}) {

  const [name, setName] = useState(item?.name || "");

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">

        <h2 className="mb-6 text-2xl font-bold">

          {item ? "修改物品" : "新增物品"}

        </h2>

        <input
          autoFocus
          className="w-full rounded-xl border p-3"
          placeholder="例如：護照"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl bg-gray-200 px-5 py-3"
          >
            取消
          </button>

          <button
            onClick={() => {

              if (!name.trim()) {

                alert("請輸入物品名稱");
                return;

              }

              onSave({
                ...item,
                id: item?.id || Date.now(),
                name,
                checked: item?.checked || false,
              });

            }}
            className="rounded-xl bg-blue-500 px-5 py-3 text-white"
          >
            儲存
          </button>

        </div>

      </div>

    </div>

  );

}