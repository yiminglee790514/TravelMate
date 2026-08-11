import { useState } from "react";
import { searchPlaceAddress } from "../services/mapsService";
import { getRegionCode, isPlaceInCountry } from "../services/mapsCountry";
import { getTransportGroupIcon } from "./TransportGroupModal";

function AddressField({ label, value, onChange, trip, placeholder }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

  async function findAddress() {
    if (!value.trim()) {
      alert(`請先輸入${label}`);
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const locationText = [trip?.country, trip?.city, trip?.destination]
        .filter(Boolean)
        .join(" ");

      const result = await searchPlaceAddress({
        query: `${value.trim()}${locationText ? ` ${locationText}` : ""}`,
        regionCode: getRegionCode(trip?.country || ""),
      });

      const places = (Array.isArray(result?.places) ? result.places : [])
        .filter((place) => isPlaceInCountry(place, trip?.country || ""))
        .filter((place) => String(place.address || "").trim());

      if (!places.length) {
        setError("找不到符合旅程國家的地址，請補充名稱或手動輸入地址。");
        return;
      }

      setResults(places.slice(0, 5));
      applyPlace(places[0]);
    } catch (error) {
      console.error(error);
      setError(error?.message || "地址搜尋失敗");
    } finally {
      setLoading(false);
    }
  }

  function applyPlace(place) {
    onChange(place.address || "", {
      placeId: place.id || "",
      placeLatitude: place.latitude ?? null,
      placeLongitude: place.longitude ?? null,
      mapsUrl: place.mapsUrl || "",
      countryCode: place.countryCode || "",
    });
  }

  return (
    <div>
      <label className="tm-modal-label mb-1 block">{label}</label>
      <div className="flex gap-2">
        <input
          className="tm-modal-input"
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            onChange(event.target.value, null);
            setError("");
            setResults([]);
          }}
        />
        <button
          type="button"
          onClick={findAddress}
          disabled={loading}
          className="tm-address-search-button shrink-0"
        >
          {loading ? "搜尋中" : "自動找"}
        </button>
      </div>

      {error && (
        <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
          ⚠️ {error}
        </div>
      )}

      {results.length > 1 && (
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {results.map((place) => (
            <button
              key={place.id || `${place.name}-${place.address}`}
              type="button"
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
  );
}

export default function TransportModal({
  transport,
  initialGroup = "一般交通",
  groupNames = [],
  groupIcons = {},
  trip,
  onClose,
  onSave,
  people = [],
  onAddPerson,
}) {
  const isEdit = !!transport;
  const [type, setType] = useState(transport?.type || "🚆 電車");
  const [company, setCompany] = useState(transport?.company || "");
  const [from, setFrom] = useState(transport?.from || "");
  const [to, setTo] = useState(transport?.to || "");
  const [fromMeta, setFromMeta] = useState(transport?.fromMeta || {});
  const [toMeta, setToMeta] = useState(transport?.toMeta || {});
  const [departureDate, setDepartureDate] = useState(transport?.departureDate || "");
  const [departureTime, setDepartureTime] = useState(transport?.departureTime || "");
  const [arrivalDate, setArrivalDate] = useState(transport?.arrivalDate || "");
  const [arrivalTime, setArrivalTime] = useState(transport?.arrivalTime || "");
  const [departureLabel, setDepartureLabel] = useState(transport?.departureLabel || "出發");
  const [arrivalLabel, setArrivalLabel] = useState(transport?.arrivalLabel || "抵達");
  const [departureDurationMinutes, setDepartureDurationMinutes] = useState(transport?.departureDurationMinutes ?? "");
  const [arrivalDurationMinutes, setArrivalDurationMinutes] = useState(transport?.arrivalDurationMinutes ?? "");
  const [price, setPrice] = useState(transport?.price || "");
  const [currency, setCurrency] = useState(transport?.currency || "JPY");
  const [group, setGroup] = useState(transport?.group || initialGroup || groupNames[0] || "一般交通");
  const [payer, setPayer] = useState(transport?.payer || "");
  const [newPayer, setNewPayer] = useState("");
  const [showPayerInput, setShowPayerInput] = useState(false);
  const [website, setWebsite] = useState(transport?.website || "");
  const [orderNumber, setOrderNumber] = useState(transport?.orderNumber || "");
  const [note, setNote] = useState(transport?.note || "");

  function handleAddPayer() {
    const name = newPayer.trim();
    if (!name) return;
    onAddPerson?.(name);
    setPayer(name);
    setNewPayer("");
    setShowPayerInput(false);
  }

  function numberOrBlank(value) {
    return value === "" ? "" : Math.max(0, Number(value) || 0);
  }

  function handleSave() {
    if (!company.trim()) {
      alert("請輸入交通名稱");
      return;
    }

    onSave({
      id: transport?.id || Date.now(),
      type,
      company: company.trim(),
      from: from.trim(),
      to: to.trim(),
      fromMeta,
      toMeta,
      departureDate,
      departureTime,
      departureLabel: departureLabel.trim() || "出發",
      departureDurationMinutes: numberOrBlank(departureDurationMinutes),
      arrivalDate,
      arrivalTime,
      arrivalLabel: arrivalLabel.trim() || "抵達",
      arrivalDurationMinutes: numberOrBlank(arrivalDurationMinutes),
      price,
      currency,
      group: group || groupNames[0] || "一般交通",
      payer,
      website,
      orderNumber: orderNumber.trim(),
      note,
    });
  }

  const availableGroups = Array.from(new Set([...groupNames, group].filter(Boolean)));

  return (
    <div className="tm-modal-backdrop items-start sm:items-center">
      <div className="tm-modal tm-transport-modal max-w-md my-3 sm:my-4">
        <h2 className="tm-modal-title mb-5">{isEdit ? "修改交通" : "新增交通"}</h2>

        <div className="space-y-4">
          <select className="tm-modal-input" value={type} onChange={(event) => setType(event.target.value)}>
            <option>✈️ 飛機</option>
            <option>🚄 新幹線</option>
            <option>🚆 電車</option>
            <option>🚇 地鐵</option>
            <option>🚌 公車</option>
            <option>🚕 計程車</option>
            <option>🚶 步行</option>
            <option>🚗 租車</option>
            <option>🚢 渡輪</option>
            <option>🚡 纜車</option>
            <option>🧭 自訂</option>
          </select>

          <input
            className="tm-modal-input"
            placeholder="交通名稱（JR、南海電鐵、TOYOTA Rent a Car...）"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />

          <div>
            <div className="tm-modal-label mb-1">交通群組</div>
            <select className="tm-modal-input" value={group} onChange={(event) => setGroup(event.target.value)}>
              {availableGroups.map((name) => (
                <option key={name} value={name}>{getTransportGroupIcon(name, groupIcons)} {name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="tm-modal-label mb-1">付款人</div>
            <div className="flex gap-2">
              <select className="tm-modal-input min-w-0 flex-1" value={payer} onChange={(event) => setPayer(event.target.value)}>
                <option value="">選擇付款人</option>
                {people.map((person) => <option key={person} value={person}>{person}</option>)}
              </select>
              <button type="button" onClick={() => setShowPayerInput((value) => !value)} className="h-11 shrink-0 rounded-xl bg-gray-100 px-3 text-sm font-semibold">＋ 人名</button>
            </div>
            {showPayerInput && (
              <div className="mt-2 flex gap-2">
                <input autoFocus className="tm-modal-input" placeholder="輸入付款人姓名" value={newPayer} onChange={(event) => setNewPayer(event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleAddPayer()} />
                <button type="button" onClick={handleAddPayer} className="tm-modal-button bg-blue-500 text-white">新增</button>
              </div>
            )}
          </div>

          <AddressField label="起點地址" value={from} onChange={(value, meta) => { setFrom(value); if (meta) setFromMeta(meta); }} trip={trip} placeholder="輸入起點名稱或地址" />
          <AddressField label="終點地址" value={to} onChange={(value, meta) => { setTo(value); if (meta) setToMeta(meta); }} trip={trip} placeholder="輸入終點名稱或地址" />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 text-sm font-bold text-slate-700">時間與行程表顯示</div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="tm-modal-label mb-1 block">出發日期</label>
                <input type="date" className="tm-modal-input" value={departureDate} onChange={(event) => setDepartureDate(event.target.value)} />
              </div>
              <div>
                <label className="tm-modal-label mb-1 block">出發時間</label>
                <input type="time" className="tm-modal-input" value={departureTime} onChange={(event) => setDepartureTime(event.target.value)} />
              </div>
              <div>
                <label className="tm-modal-label mb-1 block">顯示文字</label>
                <input className="tm-modal-input" placeholder="例如：取車" value={departureLabel} onChange={(event) => setDepartureLabel(event.target.value)} />
              </div>
              <div>
                <label className="tm-modal-label mb-1 block">停留時間（分）</label>
                <input type="number" min="0" inputMode="numeric" className="tm-modal-input" placeholder="可不填" value={departureDurationMinutes} onChange={(event) => setDepartureDurationMinutes(event.target.value)} />
              </div>
            </div>

            <div className="my-3 border-t border-slate-200" />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="tm-modal-label mb-1 block">抵達日期</label>
                <input type="date" className="tm-modal-input" value={arrivalDate} onChange={(event) => setArrivalDate(event.target.value)} />
              </div>
              <div>
                <label className="tm-modal-label mb-1 block">抵達時間</label>
                <input type="time" className="tm-modal-input" value={arrivalTime} onChange={(event) => setArrivalTime(event.target.value)} />
              </div>
              <div>
                <label className="tm-modal-label mb-1 block">顯示文字</label>
                <input className="tm-modal-input" placeholder="例如：還車" value={arrivalLabel} onChange={(event) => setArrivalLabel(event.target.value)} />
              </div>
              <div>
                <label className="tm-modal-label mb-1 block">停留時間（分）</label>
                <input type="number" min="0" inputMode="numeric" className="tm-modal-input" placeholder="可不填" value={arrivalDurationMinutes} onChange={(event) => setArrivalDurationMinutes(event.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[0.8fr_1.2fr] gap-2">
            <select className="tm-modal-input" value={currency} onChange={(event) => setCurrency(event.target.value)}>
              <option value="JPY">JPY 日圓</option>
              <option value="TWD">TWD 台幣</option>
              <option value="USD">USD 美金</option>
              <option value="KRW">KRW 韓元</option>
              <option value="CNY">CNY 人民幣</option>
              <option value="HKD">HKD 港幣</option>
              <option value="SGD">SGD 新幣</option>
              <option value="THB">THB 泰銖</option>
            </select>
            <input type="number" className="tm-modal-input" placeholder="價格" value={price} onChange={(event) => setPrice(event.target.value)} />
          </div>

          <input className="tm-modal-input" placeholder="訂單編號" value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} />
          <input className="tm-modal-input" placeholder="網站" value={website} onChange={(event) => setWebsite(event.target.value)} />
          <textarea rows="3" className="tm-modal-input resize-none" placeholder="備註" value={note} onChange={(event) => setNote(event.target.value)} />
        </div>

        <div className="sticky bottom-0 mt-5 flex justify-end gap-3 border-t border-slate-100 bg-white pt-4">
          <button type="button" onClick={onClose} className="tm-modal-button bg-gray-200 text-gray-700">取消</button>
          <button type="button" onClick={handleSave} className="tm-modal-button bg-blue-500 text-white">{isEdit ? "儲存" : "新增"}</button>
        </div>
      </div>
    </div>
  );
}
