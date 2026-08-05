import { useState } from "react";

export default function HotelModal({
  hotel,
  onClose,
  onSave,
}) {

  const isEdit = !!hotel;

  const [name, setName] = useState(hotel?.name || "");
  const [checkIn, setCheckIn] = useState(hotel?.checkIn || "");
  const [checkOut, setCheckOut] = useState(hotel?.checkOut || "");

  const [checkInTime, setCheckInTime] = useState(
    hotel?.checkInTime || ""
  );

  const [checkOutTime, setCheckOutTime] = useState(
    hotel?.checkOutTime || ""
  );

  const [address, setAddress] = useState(hotel?.address || "");
  const [phone, setPhone] = useState(hotel?.phone || "");
  const [website, setWebsite] = useState(hotel?.website || "");
  const [booking, setBooking] = useState(hotel?.booking || "");
  const [confirmation, setConfirmation] = useState(hotel?.confirmation || "");
  const [price, setPrice] = useState(hotel?.price || "");
  const [note, setNote] = useState(hotel?.note || "");

  function handleSave() {

    if (!name.trim()) {
      alert("請輸入飯店名稱");
      return;
    }

    onSave({
      id: hotel?.id || Date.now(),

      name,
      checkIn,
      checkOut,

      checkInTime,
      checkOutTime,

      address,
      phone,
      website,
      booking,
      confirmation,
      price,
      note,
    });

    onClose();

  }

  return (

    <div className="fixed inset-0 flex items-center justify-center bg-black/40 overflow-y-auto p-4">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <h2 className="mb-6 text-2xl font-bold">
          {isEdit ? "修改飯店" : "新增飯店"}
        </h2>

        <div className="space-y-4">

          <input
            className="w-full rounded-xl border p-3"
            placeholder="飯店名稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* 入住 */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                入住日期
              </label>

              <input
                type="date"
                className="w-full rounded-xl border p-3"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                入住時間
              </label>

              <input
                type="time"
                className="w-full rounded-xl border p-3"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>

          </div>

          {/* 退房 */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                退房日期
              </label>

              <input
                type="date"
                className="w-full rounded-xl border p-3"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                退房時間
              </label>

              <input
                type="time"
                className="w-full rounded-xl border p-3"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </div>

          </div>

          <input
            className="w-full rounded-xl border p-3"
            placeholder="地址"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <input
            className="w-full rounded-xl border p-3"
            placeholder="電話"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="w-full rounded-xl border p-3"
            placeholder="官方網站"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <select
            className="w-full rounded-xl border p-3"
            value={booking}
            onChange={(e) => setBooking(e.target.value)}
          >
            <option value="">訂房平台</option>
            <option>Agoda</option>
            <option>Booking.com</option>
            <option>Trip.com</option>
            <option>Hotels.com</option>
            <option>Expedia</option>
            <option>Airbnb</option>
            <option>Rakuten</option>
            <option>官方網站</option>
            <option>其他</option>
          </select>

          <input
            className="w-full rounded-xl border p-3"
            placeholder="訂房編號"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />

          <input
            type="number"
            className="w-full rounded-xl border p-3"
            placeholder="價格"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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