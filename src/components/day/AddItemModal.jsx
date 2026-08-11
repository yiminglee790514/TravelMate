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

  const [flightType, setFlightType] = useState(
  item?.flightType || "outbound"
);

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
      flightType,
      extra,
    });

    onClose();
  }

  return (
    <div className="tm-modal-backdrop">

      <div className="tm-modal">

        <h2 className="tm-modal-title mb-5">
          {isEdit ? `修改 Day ${day} 行程` : `新增 Day ${day} 行程`}
        </h2>

        <div className="space-y-4">

          <input
            type="time"
            className="tm-modal-input"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <input
            placeholder="例如：維多利亞港"
            className="tm-modal-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            placeholder="地址（例如：東京都台東區淺草2-3-1）"
            className="tm-modal-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <textarea
            placeholder="備註（例如：抽御神籤、必吃、預約時間...）"
            className="tm-modal-input"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <select
            className="tm-modal-input"
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

          <div className="rounded-2xl border bg-blue-50 p-4">

            <div className="mb-2 text-sm font-bold text-blue-700">
              ✈️ 航班
            </div>

            <label className="flex items-center gap-2 py-1.5 text-sm">

              <input
                type="radio"
                checked={flightType === "outbound"}
                onChange={() => setFlightType("outbound")}
              />

              去程

            </label>

            <label className="mt-2 flex items-center gap-2 py-1.5 text-sm">

              <input
                type="radio"
                checked={flightType === "inbound"}
                onChange={() => setFlightType("inbound")}
              />

              回程

            </label>

          </div>

        )}

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