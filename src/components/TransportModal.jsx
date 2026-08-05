import { useState } from "react";

export default function TransportModal({
  transport,
  onClose,
  onSave,
}) {

  const isEdit = !!transport;

  const [type, setType] = useState(transport?.type || "🚆 電車");
  const [company, setCompany] = useState(transport?.company || "");
  const [from, setFrom] = useState(transport?.from || "");
  const [to, setTo] = useState(transport?.to || "");

  const [departureDate, setDepartureDate] = useState(
    transport?.departureDate || ""
  );

  const [departureTime, setDepartureTime] = useState(
    transport?.departureTime || ""
  );

  const [arrivalDate, setArrivalDate] = useState(
    transport?.arrivalDate || ""
  );

  const [arrivalTime, setArrivalTime] = useState(
    transport?.arrivalTime || ""
  );

  const [price, setPrice] = useState(transport?.price || "");
  const [website, setWebsite] = useState(transport?.website || "");
  const [note, setNote] = useState(transport?.note || "");

  function handleSave() {

    if (!company.trim()) {
      alert("請輸入交通名稱");
      return;
    }

    onSave({

      id: transport?.id || Date.now(),

      type,
      company,

      from,
      to,

      departureDate,
      departureTime,

      arrivalDate,
      arrivalTime,

      price,
      website,
      note,

    });

    onClose();

  }

  return (

    <div className="fixed inset-0 flex items-center justify-center bg-black/40 overflow-y-auto p-4">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <h2 className="mb-6 text-2xl font-bold">
          {isEdit ? "修改交通" : "新增交通"}
        </h2>

        <div className="space-y-4">

          <select
            className="w-full rounded-xl border p-3"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option>✈️ 飛機</option>
            <option>🚄 新幹線</option>
            <option>🚆 電車</option>
            <option>🚇 地鐵</option>
            <option>🚌 公車</option>
            <option>🚖 計程車</option>
            <option>🚶 步行</option>
            <option>🚗 租車</option>
            <option>🚢 渡輪</option>
            <option>🚠 纜車</option>
          </select>

          <input
            className="w-full rounded-xl border p-3"
            placeholder="交通名稱（JR、南海電鐵...）"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">

            <input
              className="rounded-xl border p-3"
              placeholder="起點"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />

            <input
              className="rounded-xl border p-3"
              placeholder="終點"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />

          </div>

          <div className="grid grid-cols-2 gap-3">

            <input
              type="date"
              className="rounded-xl border p-3"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
            />

            <input
              type="time"
              className="rounded-xl border p-3"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
            />

          </div>

          <div className="grid grid-cols-2 gap-3">

            <input
              type="date"
              className="rounded-xl border p-3"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
            />

            <input
              type="time"
              className="rounded-xl border p-3"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
            />

          </div>

          <input
            type="number"
            className="w-full rounded-xl border p-3"
            placeholder="價格"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            className="w-full rounded-xl border p-3"
            placeholder="網站"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <textarea
            rows="4"
            className="w-full rounded-xl border p-3"
            placeholder="備註"
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
            {isEdit ? "儲存" : "新增"}
          </button>

        </div>

      </div>

    </div>

  );

}