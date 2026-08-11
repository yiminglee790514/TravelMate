import { useState } from "react";

export default function TripModal({
  trip,
  onClose,
  onSave,
  copyMode = false,
}) {

  const isEdit = !!trip && !copyMode;

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
    <div className="tm-modal-backdrop">

      <div className="tm-modal">

        <h2 className="tm-modal-title mb-5">
          {isEdit ? "修改旅程" : "新增旅程"}
        </h2>

        <div className="space-y-3">

          <input
            className="tm-modal-input"
            placeholder="旅程名稱"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="tm-modal-input"
            placeholder="國家"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />

          <input
            className="tm-modal-input"
            placeholder="城市"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            type="date"
            className="tm-modal-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="tm-modal-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

        </div>

        <div className="mt-6 flex justify-end gap-2.5">

          <button
            onClick={onClose}
            className="tm-modal-button bg-gray-200 text-gray-700"
          >
            取消
          </button>

          <button
            onClick={handleSave}
            className="tm-modal-button bg-blue-500 text-white"
          >
            {isEdit ? "儲存" : "建立"}
          </button>

        </div>

      </div>

    </div>
  );
}