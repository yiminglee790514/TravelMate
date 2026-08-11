import { useState } from "react";
import FlightEditor from "./editors/FlightEditor";
import { searchPlaceAddress } from "../../services/mapsService";

export default function AddItemModal({
  day,
  item,
  trip,
  onClose,
  onSave,
}) {
  const isEdit = !!item;

  const [time, setTime] = useState(item?.time || "");
  const [title, setTitle] = useState(item?.title || "");
  const [address, setAddress] = useState(item?.address || "");
  const [note, setNote] = useState(item?.note || "");
  const [type, setType] = useState(item?.type || "attraction");
  const [extra, setExtra] = useState(item?.extra || {});
  const [flightType, setFlightType] = useState(item?.flightType || "outbound");

  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressResults, setAddressResults] = useState([]);

  async function handleFindAddress() {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      alert("請先輸入景點／餐廳／飯店名稱");
      return;
    }

    setAddressLoading(true);
    setAddressError("");
    setAddressResults([]);

    try {
      const locationText = [trip?.country, trip?.city, trip?.destination]
        .filter(Boolean)
        .join(" ");

      const result = await searchPlaceAddress({
        query: `${cleanTitle}${locationText ? ` ${locationText}` : ""}`,
      });

      const places = Array.isArray(result?.places) ? result.places : [];
      if (!places.length) {
        setAddressError("找不到這個地點，請再補充城市或手動輸入地址。");
        return;
      }

      setAddressResults(places.slice(0, 5));
      applyPlace(places[0]);
    } catch (error) {
      console.error(error);
      setAddressError(error?.message || "地址搜尋失敗");
    } finally {
      setAddressLoading(false);
    }
  }

  function applyPlace(place) {
    setAddress(place.address || "");
    setExtra((prev) => ({
      ...prev,
      placeId: place.id || prev.placeId || "",
      placeLatitude: place.latitude ?? prev.placeLatitude ?? null,
      placeLongitude: place.longitude ?? prev.placeLongitude ?? null,
      mapsUrl: place.mapsUrl || prev.mapsUrl || "",
    }));
  }

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

          <div>
            <div className="flex items-center gap-2">
              <input
                placeholder="地址（也可以自動搜尋）"
                className="tm-modal-input"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setAddressError("");
                }}
              />
              <button
                type="button"
                onClick={handleFindAddress}
                disabled={addressLoading}
                className="tm-address-search-button"
              >
                {addressLoading ? "搜尋中" : "自動找"}
              </button>
            </div>

            {addressError && (
              <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                ⚠️ {addressError}
              </div>
            )}

            {addressResults.length > 1 && (
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {addressResults.map((place) => (
                  <button
                    type="button"
                    key={place.id || `${place.name}-${place.address}`}
                    onClick={() => applyPlace(place)}
                    className="block w-full border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-slate-50"
                  >
                    <div className="text-xs font-semibold text-slate-700">{place.name}</div>
                    <div className="mt-0.5 text-[11px] leading-4 text-slate-500">{place.address}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

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
              <div className="mb-2 text-sm font-bold text-blue-700">✈️ 航班</div>

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
          <button onClick={onClose} className="tm-modal-button bg-gray-200 text-gray-700">
            取消
          </button>
          <button onClick={handleSave} className="tm-modal-button bg-blue-500 text-white">
            {isEdit ? "儲存" : "建立"}
          </button>
        </div>
      </div>
    </div>
  );
}
