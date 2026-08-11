import { useMemo, useState } from "react";
import { searchPlaceAddress } from "../services/mapsService";
import { getRegionCode, isPlaceInCountry } from "../services/mapsCountry";

const CURRENCIES = [
  { code: "JPY", name: "日圓", symbol: "¥" },
  { code: "TWD", name: "台幣", symbol: "NT$" },
  { code: "USD", name: "美元", symbol: "$" },
  { code: "HKD", name: "港幣", symbol: "HK$" },
  { code: "KRW", name: "韓元", symbol: "₩" },
  { code: "CNY", name: "人民幣", symbol: "¥" },
  { code: "EUR", name: "歐元", symbol: "€" },
  { code: "GBP", name: "英鎊", symbol: "£" },
  { code: "SGD", name: "新加坡幣", symbol: "S$" },
  { code: "THB", name: "泰銖", symbol: "฿" },
];

function newRoom(people = []) {
  return {
    id: Date.now() + Math.random(),
    confirmation: "",
    bookingName: people[0] || "",
    roomType: "",
    price: "",
    currency: "JPY",
  };
}

export default function HotelGroupEditModal({ group, people = [], trip, onClose, onSave }) {
  const first = group?.hotels?.[0] || {};
  const [title, setTitle] = useState(group?.title || first.name || "");
  const [checkIn, setCheckIn] = useState(group?.checkIn || first.checkIn || "");
  const [checkOut, setCheckOut] = useState(group?.checkOut || first.checkOut || "");
  const [checkInTime, setCheckInTime] = useState(first.checkInTime || "");
  const [checkOutTime, setCheckOutTime] = useState(first.checkOutTime || "");
  const [address, setAddress] = useState(first.address || "");
  const [website, setWebsite] = useState(first.website || "");
  const [rooms, setRooms] = useState(
    group?.hotels?.length
      ? group.hotels.map((room) => ({ ...room }))
      : [newRoom(people)]
  );
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressResults, setAddressResults] = useState([]);

  const roomCountLabel = useMemo(() => `${rooms.length} 間房間`, [rooms.length]);

  async function handleFindAddress() {
    const queryName = title.trim() || first.name?.trim();
    if (!queryName) return alert("請先輸入飯店名稱");

    setAddressLoading(true);
    setAddressError("");
    setAddressResults([]);
    try {
      const query = [queryName, trip?.city].filter(Boolean).join(" ");
      const result = await searchPlaceAddress({
        query,
        regionCode: getRegionCode(trip?.country || ""),
      });
      const places = (Array.isArray(result?.places) ? result.places : [])
        .filter((place) => isPlaceInCountry(place, trip?.country || ""))
        .filter((place) => String(place.address || "").trim());
      if (!places.length) {
        setAddressError("找不到符合旅程國家的地址，請補充飯店名稱或手動輸入地址。");
        return;
      }
      setAddressResults(places.slice(0, 5));
      setAddress(places[0].address || "");
    } catch (error) {
      console.error(error);
      setAddressError(error?.message || "地址搜尋失敗");
    } finally {
      setAddressLoading(false);
    }
  }

  function updateRoom(id, patch) {
    setRooms((current) => current.map((room) => String(room.id) === String(id) ? { ...room, ...patch } : room));
  }

  function addRoom() {
    setRooms((current) => [...current, newRoom(people)]);
  }

  function removeRoom(id) {
    if (rooms.length <= 1) return alert("至少要保留一間房間");
    setRooms((current) => current.filter((room) => String(room.id) !== String(id)));
  }

  function handleSave() {
    if (!title.trim()) return alert("請輸入飯店／住宿名稱");
    if (!checkIn || !checkOut) return alert("請選擇入住與退房日期");
    if (checkOut < checkIn) return alert("退房日期不能早於入住日期");
    if (!rooms.length) return alert("至少要有一間房間");

    const shared = {
      name: title.trim(),
      checkIn,
      checkOut,
      checkInTime,
      checkOutTime,
      address,
      website,
    };

    const normalizedRooms = rooms.map((room) => ({
      ...room,
      ...shared,
      bookingName: room.bookingName || people[0] || "",
      currency: room.currency || "JPY",
    }));

    onSave({
      ...group,
      title: title.trim(),
      checkIn,
      checkOut,
      hotels: normalizedRooms,
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="shrink-0 border-b border-slate-100 px-5 py-4 sm:px-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">修改住宿資料</h2>
              <p className="mt-1 text-sm text-slate-500">飯店資料與房間都在同一個清單修改</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600">{roomCountLabel}</span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 text-base font-bold text-slate-800">🏨 住宿資料</div>
            <div className="space-y-3">
              <input className="tm-modal-input" placeholder="飯店名稱" value={title} onChange={(e) => setTitle(e.target.value)} />

              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs text-slate-500">入住日期</label><input type="date" className="tm-modal-input" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></div>
                <div><label className="mb-1 block text-xs text-slate-500">退房日期</label><input type="date" className="tm-modal-input" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs text-slate-500">Check in</label><input type="time" className="tm-modal-input" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} /></div>
                <div><label className="mb-1 block text-xs text-slate-500">Check out</label><input type="time" className="tm-modal-input" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} /></div>
              </div>

              <div>
                <div className="flex gap-2">
                  <input className="tm-modal-input" placeholder="地址（也可以自動搜尋）" value={address} onChange={(e) => { setAddress(e.target.value); setAddressError(""); }} />
                  <button type="button" onClick={handleFindAddress} disabled={addressLoading} className="tm-address-search-button">{addressLoading ? "搜尋中" : "自動找"}</button>
                </div>
                {addressError && <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">⚠️ {addressError}</div>}
                {addressResults.length > 1 && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {addressResults.map((place) => (
                      <button key={place.id || `${place.name}-${place.address}`} type="button" onClick={() => setAddress(place.address || "")} className="block w-full border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-slate-50">
                        <div className="text-xs font-semibold text-slate-700">{place.name}</div>
                        <div className="mt-0.5 text-[11px] leading-4 text-slate-500">{place.address}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input className="tm-modal-input" placeholder="官網（https://...）" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-base font-bold text-slate-800">🛏️ 房間資料</div>
              <span className="text-sm font-semibold text-slate-400">共 {rooms.length} 間</span>
            </div>

            <div className="space-y-3">
              {rooms.map((room, index) => (
                <div key={room.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="font-bold text-blue-600">房間 {index + 1}</div>
                    {rooms.length > 1 && <button type="button" onClick={() => removeRoom(room.id)} className="text-sm font-semibold text-red-500">刪除</button>}
                  </div>
                  <div className="space-y-3">
                    <input className="tm-modal-input" placeholder="訂單編號" value={room.confirmation || ""} onChange={(e) => updateRoom(room.id, { confirmation: e.target.value })} />
                    <select className="tm-modal-input" value={room.bookingName || ""} onChange={(e) => updateRoom(room.id, { bookingName: e.target.value })}>
                      <option value="">選擇訂位姓名</option>
                      {people.map((person) => <option key={person} value={person}>{person}</option>)}
                      {room.bookingName && !people.includes(room.bookingName) && <option value={room.bookingName}>{room.bookingName}</option>}
                    </select>
                    <input className="tm-modal-input" placeholder="房型，例如：禁菸雙床房" value={room.roomType || ""} onChange={(e) => updateRoom(room.id, { roomType: e.target.value })} />
                    <div className="grid grid-cols-[110px_1fr] gap-2">
                      <select className="tm-modal-input" value={room.currency || "JPY"} onChange={(e) => updateRoom(room.id, { currency: e.target.value })}>
                        {CURRENCIES.map((item) => <option key={item.code} value={item.code}>{item.symbol} {item.code}</option>)}
                      </select>
                      <input type="number" className="tm-modal-input" placeholder="價格（可不填）" value={room.price ?? ""} onChange={(e) => updateRoom(room.id, { price: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" onClick={addRoom} className="w-full rounded-2xl border border-dashed border-blue-300 bg-blue-50/60 py-3.5 text-sm font-semibold text-blue-600 hover:bg-blue-50">
                ＋ 新增房間
              </button>
            </div>
          </section>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t bg-white px-5 py-4 sm:px-7">
          <button type="button" onClick={onClose} className="rounded-xl bg-gray-200 px-5 py-3">取消</button>
          <button type="button" onClick={handleSave} className="rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white">儲存</button>
        </div>
      </div>
    </div>
  );
}
