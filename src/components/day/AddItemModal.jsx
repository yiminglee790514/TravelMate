import { useState } from "react";
import FlightEditor from "./editors/FlightEditor";
import { searchPlaceAddress } from "../../services/mapsService";
import { getRegionCode } from "../../services/mapsCountry";

export default function AddItemModal({
  day,
  item,
  trip,
  linkedHotel = false,
  linkedTransport = false,
  onClose,
  onSave,
}) {
  const isEdit = !!item;

  const [time, setTime] = useState(item?.time || "");
  const [title, setTitle] = useState(item?.title || "");
  const [address, setAddress] = useState(item?.address || "");
  const [note, setNote] = useState(item?.note || "");
  const [eventLabel, setEventLabel] = useState(item?.extra?.eventLabel || "");
  const [durationMinutes, setDurationMinutes] = useState(
    item?.durationMinutes ?? item?.extra?.durationMinutes ?? ""
  );
  const [type, setType] = useState(item?.type || "attraction");
  const [extra, setExtra] = useState(item?.extra || {});
  const [flightType, setFlightType] = useState(item?.flightType || "outbound");
  const [saving, setSaving] = useState(false);

  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressResults, setAddressResults] = useState([]);

  async function handleFindAddress() {
    const cleanTitle = linkedTransport ? (address.trim() || title.trim()) : title.trim();
    if (!cleanTitle) {
      alert(linkedTransport ? "請先輸入地點名稱或地址" : "請先輸入景點／餐廳／飯店名稱");
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
        regionCode: getRegionCode(trip?.country || ""),
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
      countryCode: place.countryCode || prev.countryCode || "",
    }));
  }

  async function handleSave() {
    if (saving) return;

    if (!time || !title.trim()) {
      alert("請輸入時間與名稱");
      return;
    }

    setSaving(true);

    try {
      await onSave({
        id: item?.id || Date.now(),
        day,
        time,
        title,
        address,
        note,
        durationMinutes:
          durationMinutes === "" ? "" : Math.max(0, Number(durationMinutes) || 0),
        type,
        flightType,
        extra: { ...extra, ...(linkedTransport ? { eventLabel: eventLabel.trim() } : {}) },
      });
    } catch (error) {
      console.error("儲存行程失敗", error);
      alert(error?.message || "儲存失敗，請稍後再試。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tm-modal-backdrop">
      <div className="tm-modal">
        <h2 className="tm-modal-title mb-5">
          {isEdit ? `修改 Day ${day} 行程` : `新增 Day ${day} 行程`}
        </h2>

        <div className="space-y-4">
          {linkedHotel && (
            <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">🏨 這筆飯店由住宿資料自動同步，這裡只修改行程表上的時間。</div>
          )}
          {linkedTransport && (
            <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">🚆 這筆交通由交通資料自動同步；可以修改顯示文字、地址與停留時間。</div>
          )}

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
            disabled={linkedHotel}
          />

          {linkedTransport && (
            <input placeholder="例如：取車、還車、搭乘飛機" className="tm-modal-input" value={eventLabel} onChange={(e) => setEventLabel(e.target.value)} />
          )}

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
                disabled={linkedHotel}
              />
              <button
                type="button"
                onClick={handleFindAddress}
                disabled={addressLoading || linkedHotel}
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

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">⏱️ 停留時間（分鐘）</label>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="例如：60"
              className="tm-modal-input"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
            <div className="mt-1 text-xs text-slate-400">只記錄停留時間供你參考，不會自動修改下一個行程時間。</div>
          </div>

          {!linkedHotel && (
            <textarea
            placeholder="備註（例如：抽御神籤、必吃、預約時間...）"
            className="tm-modal-input"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          )}

          {!linkedHotel && (
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
          )}

          {type === "flight" && !linkedHotel && (
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
          <button onClick={onClose} disabled={saving} className="tm-modal-button bg-gray-200 text-gray-700 disabled:opacity-50">
            取消
          </button>
          <button onClick={handleSave} disabled={saving} className="tm-modal-button bg-blue-500 text-white disabled:opacity-60">
            {saving ? "儲存中…" : (isEdit ? "儲存" : "建立")}
          </button>
        </div>
      </div>
    </div>
  );
}
