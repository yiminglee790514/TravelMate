import { useState } from "react";
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

function makeRoom(source = {}, people = []) {
  return {
    id: source.id || Date.now() + Math.random(),
    confirmation: source.confirmation || "",
    bookingName: source.bookingName || people[0] || "",
    roomType: source.roomType || "",
    price: source.price ?? "",
    currency: source.currency || "JPY",
  };
}

export default function HotelModal({
  hotel,
  rooms = [],
  groupEdit = false,
  onSaveGroup,
  onClose,
  onSave,
  copyMode = false,
  hotelGroups = [],
  currentGroupId = "",
  people = [],
  onAddPerson,
  trip,
}) {
  const isEdit = !!hotel && !copyMode;
  const currentGroup = hotelGroups.find((group) => String(group.id) === String(currentGroupId));

  const [targetGroupId, setTargetGroupId] = useState(currentGroupId || "");
  const [name, setName] = useState(hotel?.name || currentGroup?.title || "");
  const [checkIn, setCheckIn] = useState(hotel?.checkIn || currentGroup?.checkIn || "");
  const [checkOut, setCheckOut] = useState(hotel?.checkOut || currentGroup?.checkOut || "");
  const [checkInTime, setCheckInTime] = useState(hotel?.checkInTime || rooms[0]?.checkInTime || "");
  const [checkOutTime, setCheckOutTime] = useState(hotel?.checkOutTime || rooms[0]?.checkOutTime || "");
  const [address, setAddress] = useState(hotel?.address || rooms[0]?.address || "");
  const [website, setWebsite] = useState(hotel?.website || rooms[0]?.website || "");
  const [confirmation, setConfirmation] = useState(hotel?.confirmation || "");
  const [bookingName, setBookingName] = useState(hotel?.bookingName || people[0] || "");
  const [roomType, setRoomType] = useState(hotel?.roomType || "");
  const [price, setPrice] = useState(hotel?.price ?? "");
  const [currency, setCurrency] = useState(hotel?.currency || "JPY");
  const [phone, setPhone] = useState(hotel?.phone || rooms[0]?.phone || "");
  const [booking, setBooking] = useState(hotel?.booking || rooms[0]?.booking || "");
  const [note, setNote] = useState(hotel?.note || rooms[0]?.note || "");

  const [roomList, setRoomList] = useState(() =>
    groupEdit ? (rooms.length ? rooms.map((room) => makeRoom(room, people)) : [makeRoom({}, people)]) : []
  );

  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressResults, setAddressResults] = useState([]);
  const [newPerson, setNewPerson] = useState("");
  const [showPersonInput, setShowPersonInput] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFindAddress() {
    const cleanName = name.trim();
    if (!cleanName) {
      alert("請先輸入飯店名稱");
      return;
    }

    setAddressLoading(true);
    setAddressError("");
    setAddressResults([]);

    try {
      const query = [cleanName, trip?.city].filter(Boolean).join(" ");
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
  }

  function handleAddPerson() {
    const clean = newPerson.trim();
    if (!clean) return;
    onAddPerson?.(clean);
    if (groupEdit) {
      setRoomList((list) => list.map((room, index) => index === 0 && !room.bookingName ? { ...room, bookingName: clean } : room));
    } else {
      setBookingName(clean);
    }
    setNewPerson("");
    setShowPersonInput(false);
  }

  function updateRoom(index, key, value) {
    setRoomList((list) => list.map((room, i) => (i === index ? { ...room, [key]: value } : room)));
  }

  function addRoom() {
    setRoomList((list) => [...list, makeRoom({}, people)]);
  }

  async function handleSave() {
    if (saving) return;

    if (!name.trim()) return alert("請輸入飯店名稱");
    if (!checkIn || !checkOut) return alert("請選擇入住與退房日期");
    if (checkOut < checkIn) return alert("退房日期不能早於入住日期");

    if (groupEdit) {
      const invalidRoom = roomList.find((room) => !String(room.bookingName || "").trim());
      if (invalidRoom) return alert("請選擇每一間房的訂位姓名");

      setSaving(true);

      try {
        await onSaveGroup?.({
          name: name.trim(),
          checkIn,
          checkOut,
          checkInTime,
          checkOutTime,
          address,
          website,
          phone,
          booking,
          note,
          rooms: roomList.map((room) => ({
            ...room,
            confirmation: String(room.confirmation || "").trim(),
            bookingName: String(room.bookingName || "").trim(),
            roomType: String(room.roomType || "").trim(),
            price: room.price ?? "",
            currency: room.currency || "JPY",
          })),
        });
      } catch (error) {
        console.error("儲存住宿失敗", error);
        alert(error?.message || "儲存住宿失敗，請稍後再試。");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!bookingName.trim()) return alert("請選擇訂位姓名");
    if (!currency && price) return alert("請選擇價格幣別");

    setSaving(true);

    try {
      await onSave?.(
        {
          id: copyMode ? Date.now() : (hotel?.id || Date.now()),
          name: name.trim(),
          checkIn,
          checkOut,
          checkInTime,
          checkOutTime,
          address,
          phone,
          website,
          confirmation,
          bookingName,
          roomType,
          price,
          currency,
          note,
        },
        targetGroupId
      );
    } catch (error) {
      console.error("儲存住宿失敗", error);
      alert(error?.message || "儲存住宿失敗，請稍後再試。");
    } finally {
      setSaving(false);
    }
  }

  const modalTitle = groupEdit ? "修改住宿" : copyMode ? "新增房間" : isEdit ? "修改房間" : "新增飯店";
  const modalSubtitle = groupEdit ? "飯店基本資料與所有房間資料" : copyMode ? "複製後可再修改房間資料" : "飯店基本資料與房間資料";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="shrink-0 px-5 pt-5 sm:px-8 sm:pt-7">
          <h2 className="text-xl font-bold sm:text-2xl">{modalTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{modalSubtitle}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8">
          <div className="space-y-4">
            {copyMode && (
              <select className="tm-modal-input" value={targetGroupId} onChange={(e) => setTargetGroupId(e.target.value)}>
                <option value="">請選擇住宿群組</option>
                {hotelGroups.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}
              </select>
            )}

            <input className="tm-modal-input" placeholder="飯店名稱" value={name} onChange={(e) => setName(e.target.value)} />

            <div>
              <div className="flex items-center gap-2">
                <input className="tm-modal-input" placeholder="地址（也可以自動搜尋）" value={address} onChange={(e) => { setAddress(e.target.value); setAddressError(""); }} />
                <button type="button" onClick={handleFindAddress} disabled={addressLoading} className="tm-address-search-button">
                  {addressLoading ? "搜尋中" : "自動找"}
                </button>
              </div>
              {addressError && <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">⚠️ {addressError}</div>}
              {addressResults.length > 1 && (
                <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  {addressResults.map((place) => (
                    <button type="button" key={place.id || `${place.name}-${place.address}`} onClick={() => applyPlace(place)} className="block w-full border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-slate-50">
                      <div className="text-xs font-semibold text-slate-700">{place.name}</div>
                      <div className="mt-0.5 text-[11px] leading-4 text-slate-500">{place.address}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-xs text-slate-500">入住日期</label><input type="date" className="tm-modal-input" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></div>
              <div><label className="mb-1 block text-xs text-slate-500">退房日期</label><input type="date" className="tm-modal-input" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-xs text-slate-500">Check in</label><input type="time" className="tm-modal-input" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} /></div>
              <div><label className="mb-1 block text-xs text-slate-500">Check out</label><input type="time" className="tm-modal-input" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} /></div>
            </div>

            <input className="tm-modal-input" placeholder="官網（https://...）" value={website} onChange={(e) => setWebsite(e.target.value)} />

            {groupEdit ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="font-bold text-slate-700">🛏️ 房間資料</div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">共 {roomList.length} 間</span>
                </div>

                {roomList.map((room, index) => (
                  <div key={room.id} className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 last:mb-0">
                    <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="font-bold text-blue-600">房間 {index + 1}</div>
                    <button
                      type="button"
                      onClick={() => setRoomList((list) => list.filter((_, roomIndex) => roomIndex !== index))}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                    >
                      🗑 刪除
                    </button>
                  </div>
                    <input className="tm-modal-input mb-3" placeholder="訂單編號" value={room.confirmation} onChange={(e) => updateRoom(index, "confirmation", e.target.value)} />

                    <div className="flex gap-2">
                      <select className="tm-modal-input min-w-0 flex-1" value={room.bookingName} onChange={(e) => updateRoom(index, "bookingName", e.target.value)}>
                        <option value="">選擇訂位姓名</option>
                        {people.map((person) => <option key={person} value={person}>{person}</option>)}
                        {room.bookingName && !people.includes(room.bookingName) && <option value={room.bookingName}>{room.bookingName}</option>}
                      </select>
                      {index === 0 && (
                        <button type="button" onClick={() => setShowPersonInput((v) => !v)} className="shrink-0 rounded-xl bg-white px-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">＋人名</button>
                      )}
                    </div>

                    <input className="tm-modal-input mt-3" placeholder="房型，例如：禁菸雙床房" value={room.roomType} onChange={(e) => updateRoom(index, "roomType", e.target.value)} />
                    <div className="mt-3 grid grid-cols-[110px_1fr] gap-2">
                      <select className="tm-modal-input" value={room.currency} onChange={(e) => updateRoom(index, "currency", e.target.value)}>
                        {CURRENCIES.map((item) => <option key={item.code} value={item.code}>{item.symbol} {item.code}</option>)}
                      </select>
                      <input type="number" className="tm-modal-input" placeholder="價格（可不填）" value={room.price} onChange={(e) => updateRoom(index, "price", e.target.value)} />
                    </div>
                  </div>
                ))}

                {showPersonInput && (
                  <div className="mb-4 flex gap-2">
                    <input autoFocus className="tm-modal-input min-w-0 flex-1" placeholder="輸入人名" value={newPerson} onChange={(e) => setNewPerson(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddPerson()} />
                    <button type="button" onClick={handleAddPerson} className="rounded-xl bg-blue-500 px-4 text-sm font-semibold text-white">新增</button>
                  </div>
                )}

                <button type="button" onClick={addRoom} className="w-full rounded-xl border border-dashed border-blue-200 bg-white py-3 font-bold text-blue-600 hover:bg-blue-50">
                  ＋ 新增房間
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 font-bold text-slate-700">🛏️ 房間資料</div>
                <input className="tm-modal-input mb-3" placeholder="訂單編號" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />

                <div className="flex gap-2">
                  <select className="tm-modal-input min-w-0 flex-1" value={bookingName} onChange={(e) => setBookingName(e.target.value)}>
                    <option value="">選擇訂位姓名</option>
                    {people.map((person) => <option key={person} value={person}>{person}</option>)}
                    {bookingName && !people.includes(bookingName) && <option value={bookingName}>{bookingName}</option>}
                  </select>
                  <button type="button" onClick={() => setShowPersonInput((v) => !v)} className="shrink-0 rounded-xl bg-white px-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">＋人名</button>
                </div>

                {showPersonInput && (
                  <div className="mt-2 flex gap-2">
                    <input autoFocus className="tm-modal-input min-w-0 flex-1" placeholder="輸入人名" value={newPerson} onChange={(e) => setNewPerson(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddPerson()} />
                    <button type="button" onClick={handleAddPerson} className="rounded-xl bg-blue-500 px-4 text-sm font-semibold text-white">新增</button>
                  </div>
                )}

                <input className="tm-modal-input mt-3" placeholder="房型，例如：禁菸雙床房" value={roomType} onChange={(e) => setRoomType(e.target.value)} />
                <div className="mt-3 grid grid-cols-[110px_1fr] gap-2">
                  <select className="tm-modal-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {CURRENCIES.map((item) => <option key={item.code} value={item.code}>{item.symbol} {item.code}</option>)}
                  </select>
                  <input type="number" className="tm-modal-input" placeholder="價格（可不填）" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>
            )}

            <input className="tm-modal-input" placeholder="電話（可不填）" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <select className="tm-modal-input" value={booking} onChange={(e) => setBooking(e.target.value)}>
              <option value="">訂房平台（可不填）</option>
              <option>Agoda</option><option>Booking.com</option><option>Trip.com</option><option>Hotels.com</option><option>Expedia</option><option>Airbnb</option><option>Rakuten</option><option>官方網站</option><option>其他</option>
            </select>
            <textarea rows="3" className="tm-modal-input" placeholder="備註（可不填）" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t bg-white px-5 py-4 sm:px-8">
          <button type="button" onClick={onClose} className="rounded-xl bg-gray-200 px-5 py-3">取消</button>
          <button type="button" onClick={handleSave} className="rounded-xl bg-blue-500 px-5 py-3 text-white">{copyMode ? "新增" : "儲存"}</button>
        </div>
      </div>
    </div>
  );
}
