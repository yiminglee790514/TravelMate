import { useState } from "react";

export default function TripModal({
  trip,
  onClose,
  onSave,
}) {

  const isEdit = !!trip;

  const [title, setTitle] = useState(trip?.title || "");
  const [country, setCountry] = useState(trip?.country || "");
  const [city, setCity] = useState(trip?.city || "");
  const [startDate, setStartDate] = useState(trip?.startDate || "");
  const [endDate, setEndDate] = useState(trip?.endDate || "");

  async function handleSave() {

    if (!title.trim()) {
      alert("請輸入旅程名稱");
      return;
    }

    if (!startDate || !endDate) {
      alert("請選擇完整的旅程日期");
      return;
    }

    if (endDate < startDate) {
      alert("結束日期不能早於開始日期");
      return;
    }

    // 城市改變時重新整理天氣
    const weather =
      city !== trip?.city
        ? (trip?.weather || []).map((day) => ({
            ...day,
            city,
            forecast: null,
          }))
        : trip?.weather || [];

    const updatedTrip = {
      ...(trip || {}),

      // 保留原本 id
      id: trip?.id || Date.now(),

      title: title.trim(),
      country: country.trim(),
      city: city.trim(),

      startDate,
      endDate,

      items: trip?.items || [],

      flights: trip?.flights || {
        outbound: null,
        inbound: null,
      },

      hotels: trip?.hotels || [],

      transports: trip?.transports || [],

      weather,

      expenses: trip?.expenses || [],

      tickets: trip?.tickets || [],

      packing: trip?.packing || [],
    };

    // 確定真的有資料才送出去
    if (!updatedTrip) {
      alert("旅程資料不存在，請重新開啟");
      return;
    }

    await onSave(updatedTrip);

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <h2 className="mb-6 text-2xl font-bold">
          {isEdit ? "修改旅程" : "新增旅程"}
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
            {isEdit ? "儲存" : "建立"}
          </button>

        </div>

      </div>

    </div>
  );
}