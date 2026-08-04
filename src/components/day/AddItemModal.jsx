import { useState } from "react";

export default function AddItemModal({ onClose, onSave }) {

  const [time, setTime] = useState("");

  const [title, setTitle] = useState("");

  const [type, setType] = useState("attraction");

  function handleSave() {

    if (!time || !title.trim()) {
      alert("請輸入時間與名稱");
      return;
    }

    onSave({
      id: Date.now(),
      time,
      title,
      type,
      address: "",
      note: "",
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="w-[420px] rounded-3xl bg-white p-8 shadow-2xl">

        <h2 className="mb-6 text-2xl font-bold">
          新增行程
        </h2>

        <div className="space-y-4">

          <input
            type="time"
            className="w-full rounded-xl border p-3"
            value={time}
            onChange={(e)=>setTime(e.target.value)}
          />

          <input
            placeholder="例如：維多利亞港"
            className="w-full rounded-xl border p-3"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
          />

          <select
            className="w-full rounded-xl border p-3"
            value={type}
            onChange={(e)=>setType(e.target.value)}
          >

            <option value="flight">✈️ 飛機</option>

            <option value="hotel">🏨 飯店</option>

            <option value="restaurant">🍜 餐廳</option>

            <option value="attraction">📍 景點</option>

            <option value="shopping">🛍️ 購物</option>

            <option value="transport">🚆 交通</option>

          </select>

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
            建立
          </button>

        </div>

      </div>

    </div>
  );
}