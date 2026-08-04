import { useState } from "react";

export default function AddTripModal({ onClose, onSave }) {

  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function handleSave() {

    if (!title.trim()) {
      alert("請輸入旅程名稱");
      return;
    }

    onSave({
      id: Date.now(),
      title,
      country,
      city,
      startDate,
      endDate,

      // 每個旅程都有自己的行程
      items: [],
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">

      <div className="w-[420px] rounded-3xl bg-white p-8 shadow-2xl">

        <h2 className="mb-6 text-2xl font-bold">
          新增旅程
        </h2>

        <div className="space-y-4">

          <input
            className="w-full rounded-xl border p-3"
            placeholder="旅程名稱"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="w-full rounded-xl border p-3"
            placeholder="國家"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />

          <input
            className="w-full rounded-xl border p-3"
            placeholder="城市"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            type="date"
            className="w-full rounded-xl border p-3"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="w-full rounded-xl border p-3"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

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