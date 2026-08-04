import { useState } from "react";
import FlightEditor from "./editors/FlightEditor";

export default function AddItemModal({
  day,
  item,
  onClose,
  onSave,
}) {

  const isEdit = !!item;

  const [time, setTime] = useState(item?.time || "");
  const [title, setTitle] = useState(item?.title || "");
  const [address, setAddress] = useState(item?.address || "");
  const [note, setNote] = useState(item?.note || "");
  const [type, setType] = useState(item?.type || "attraction");

  // 專門存放各種類型的額外資料
  const [extra, setExtra] = useState(item?.extra || {});

  function handleSave() {

    if (!time || !title.trim()) {
      alert("請輸入時間與名稱");
      return;
    }

    onSave({
      id: item?.id || Date.now(),
      day,
      time,
      title,
      address,
      note,
      type,
      extra,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="w-[420px] rounded-3xl bg-white p-8 shadow-2xl">

        <h2 className="mb-6 text-2xl font-bold">
          {isEdit ? `修改 Day ${day} 行程` : `新增 Day ${day} 行程`}
        </h2>

        <div className="space-y-4">

          <input
            type="time"
            className="w-full rounded-xl border p-3"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <input
            placeholder="例如：維多利亞港"
            className="w-full rounded-xl border p-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            placeholder="地址（例如：東京都台東區淺草2-3-1）"
            className="w-full rounded-xl border p-3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <textarea
            placeholder="備註（例如：抽御神籤、必吃、預約時間...）"
            className="w-full rounded-xl border p-3"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <select
            className="w-full rounded-xl border p-3"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="flight">✈️ 飛機</option>
            <option value="hotel">🏨 飯店</option>
            <option value="restaurant">🍜 餐廳</option>
            <option value="attraction">📍 景點</option>
            <option value="shopping">🛍️ 購物</option>
            <option value="transport">🚆 交通</option>
          </select>

          {type === "flight" && (
              <FlightEditor
                extra={extra}
                setExtra={setExtra}
              />
            )}

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl bg-gray-200 px-5 py-3"
          >
            取消
          </button>

          <button
            onClick={handleSave}
            className="rounded-xl bg-blue-500 px-5 py-3 text-white"
          >
            {isEdit ? "儲存" : "建立"}
          </button>

        </div>

      </div>

    </div>
  );
}