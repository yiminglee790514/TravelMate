import { useState } from "react";

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

export default function HotelModal({
  hotel,
  onClose,
  onSave,
  copyMode = false,
}) {

  const isEdit = !!hotel && !copyMode;

  const [name, setName] = useState(
    hotel?.name || ""
  );

  const [checkIn, setCheckIn] = useState(
    hotel?.checkIn || ""
  );

  const [checkOut, setCheckOut] = useState(
    hotel?.checkOut || ""
  );

  const [checkInTime, setCheckInTime] = useState(
    hotel?.checkInTime || ""
  );

  const [checkOutTime, setCheckOutTime] = useState(
    hotel?.checkOutTime || ""
  );

  const [address, setAddress] = useState(
    hotel?.address || ""
  );

  const [phone, setPhone] = useState(
    hotel?.phone || ""
  );

  const [website, setWebsite] = useState(
    hotel?.website || ""
  );

  const [booking, setBooking] = useState(
    hotel?.booking || ""
  );

  const [confirmation, setConfirmation] = useState(
    hotel?.confirmation || ""
  );

  const [bookingName, setBookingName] = useState(
    hotel?.bookingName || ""
  );

  const [roomType, setRoomType] = useState(
    hotel?.roomType || ""
  );

  const [price, setPrice] = useState(
    hotel?.price || ""
  );

  const [currency, setCurrency] = useState(
    hotel?.currency || ""
  );

  const [note, setNote] = useState(
    hotel?.note || ""
  );

  function handleSave() {

    if (!name.trim()) {

      alert("請輸入飯店名稱");

      return;

    }

    if (!currency && price) {

      alert("請選擇價格幣別");

      return;

    }

    onSave({

      id: copyMode ? Date.now() : (hotel?.id || Date.now()),

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

      bookingName,

      roomType,

      price,

      currency,

      note,

    });

    onClose();

  }

  return (

    <div className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/40
      p-3
      sm:p-4
    ">

      <div className="
        flex
        max-h-[88vh]
        w-full
        max-w-md
        flex-col
        overflow-hidden
        rounded-3xl
        bg-white
        shadow-2xl
      ">

        {/* =========================
            標題
        ========================= */}

        <div className="shrink-0 px-5 pt-5 sm:px-8 sm:pt-7">

          <h2 className="text-2xl font-bold">
            {isEdit ? "修改飯店" : "新增飯店"}
          </h2>

        </div>


        {/* =========================
            表單
        ========================= */}

        <div className="
          min-h-0
          flex-1
          overflow-y-auto
          px-5
          py-5
          sm:px-8
        ">

          <div className="space-y-4">

            {/* =========================
                飯店名稱
            ========================= */}

            <input
              className="
                w-full
                rounded-xl
                border
                px-3
                py-2.5
                text-[15px]
                sm:p-3
                sm:text-base
              "
              placeholder="飯店名稱"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />


            {/* =========================
                入住
            ========================= */}

            <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3">

              <div className="min-w-0">

                <label className="
                  mb-1
                  block
                  text-xs
                  font-medium
                  text-gray-600
                  sm:text-sm
                ">
                  入住日期
                </label>

                <input
                  type="date"
                  className="
                    block
                    h-11
                    w-full
                    min-w-0
                    appearance-auto
                    rounded-xl
                    border
                    px-2
                    text-[13px]
                    sm:h-auto
                    sm:p-3
                    sm:text-base
                  "
                  value={checkIn}
                  onChange={(e) =>
                    setCheckIn(e.target.value)
                  }
                />

              </div>


              <div className="min-w-0">

                <label className="
                  mb-1
                  block
                  text-xs
                  font-medium
                  text-gray-600
                  sm:text-sm
                ">
                  入住時間
                </label>

                <input
                  type="time"
                  className="
                    block
                    h-11
                    w-full
                    min-w-0
                    rounded-xl
                    border
                    px-2
                    text-[13px]
                    sm:h-auto
                    sm:p-3
                    sm:text-base
                  "
                  value={checkInTime}
                  onChange={(e) =>
                    setCheckInTime(e.target.value)
                  }
                />

              </div>

            </div>


            {/* =========================
                退房
            ========================= */}

            <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3">

              <div className="min-w-0">

                <label className="
                  mb-1
                  block
                  text-xs
                  font-medium
                  text-gray-600
                  sm:text-sm
                ">
                  退房日期
                </label>

                <input
                  type="date"
                  className="
                    block
                    h-11
                    w-full
                    min-w-0
                    appearance-auto
                    rounded-xl
                    border
                    px-2
                    text-[13px]
                    sm:h-auto
                    sm:p-3
                    sm:text-base
                  "
                  value={checkOut}
                  onChange={(e) =>
                    setCheckOut(e.target.value)
                  }
                />

              </div>


              <div className="min-w-0">

                <label className="
                  mb-1
                  block
                  text-xs
                  font-medium
                  text-gray-600
                  sm:text-sm
                ">
                  退房時間
                </label>

                <input
                  type="time"
                  className="
                    block
                    h-11
                    w-full
                    min-w-0
                    rounded-xl
                    border
                    px-2
                    text-[13px]
                    sm:h-auto
                    sm:p-3
                    sm:text-base
                  "
                  value={checkOutTime}
                  onChange={(e) =>
                    setCheckOutTime(e.target.value)
                  }
                />

              </div>

            </div>


            {/* =========================
                訂位姓名
            ========================= */}

            <input
              className="
                w-full
                rounded-xl
                border
                px-3
                py-2.5
                text-[15px]
                sm:p-3
                sm:text-base
              "
              placeholder="訂位姓名"
              value={bookingName}
              onChange={(e) =>
                setBookingName(e.target.value)
              }
            />


            {/* =========================
                房型
            ========================= */}

            <input
              className="
                w-full
                rounded-xl
                border
                px-3
                py-2.5
                text-[15px]
                sm:p-3
                sm:text-base
              "
              placeholder="房型，例如：雙人房、單人房"
              value={roomType}
              onChange={(e) =>
                setRoomType(e.target.value)
              }
            />


            {/* =========================
                地址
            ========================= */}

            <input
              className="
                w-full
                rounded-xl
                border
                px-3
                py-2.5
                text-[15px]
                sm:p-3
                sm:text-base
              "
              placeholder="地址"
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
            />


            {/* =========================
                電話
            ========================= */}

            <input
              className="
                w-full
                rounded-xl
                border
                px-3
                py-2.5
                text-[15px]
                sm:p-3
                sm:text-base
              "
              placeholder="電話"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />


            {/* =========================
                官方網站
            ========================= */}

            <input
              className="
                w-full
                rounded-xl
                border
                px-3
                py-2.5
                text-[15px]
                sm:p-3
                sm:text-base
              "
              placeholder="官方網站"
              value={website}
              onChange={(e) =>
                setWebsite(e.target.value)
              }
            />


            {/* =========================
                訂房平台
            ========================= */}

            <select
              className="
                w-full
                rounded-xl
                border
                px-3
                py-2.5
                text-[15px]
                sm:p-3
                sm:text-base
              "
              value={booking}
              onChange={(e) =>
                setBooking(e.target.value)
              }
            >

              <option value="">
                訂房平台
              </option>

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


            {/* =========================
                訂房編號
            ========================= */}

            <input
              className="
                w-full
                rounded-xl
                border
                px-3
                py-2.5
                text-[15px]
                sm:p-3
                sm:text-base
              "
              placeholder="訂房編號"
              value={confirmation}
              onChange={(e) =>
                setConfirmation(e.target.value)
              }
            />


            {/* =========================
                價格
            ========================= */}

            <div>

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-gray-600
              ">
                價格
              </label>

              <input
                type="number"
                className="
                  w-full
                  rounded-xl
                  border
                  px-3
                  py-2.5
                  text-[15px]
                  sm:p-3
                  sm:text-base
                "
                placeholder="例如：11800"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
              />

            </div>


            {/* =========================
                幣別
            ========================= */}

            <select
              className="
                w-full
                rounded-xl
                border
                px-3
                py-2.5
                text-[15px]
                sm:p-3
                sm:text-base
              "
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value)
              }
            >

              <option value="">
                請選擇幣別
              </option>

              {CURRENCIES.map((item) => (

                <option
                  key={item.code}
                  value={item.code}
                >
                  {item.code}｜{item.name} {item.symbol}
                </option>

              ))}

            </select>


            {/* =========================
                備註
            ========================= */}

            <textarea
              rows="4"
              className="
                w-full
                rounded-xl
                border
                px-3
                py-2.5
                text-[15px]
                sm:p-3
                sm:text-base
              "
              placeholder="備註"
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
            />

          </div>

        </div>


        {/* =========================
            按鈕
        ========================= */}

        <div className="
          flex
          shrink-0
          justify-end
          gap-3
          border-t
          bg-white
          px-5
          py-4
          sm:px-8
        ">

          <button
            onClick={onClose}
            className="
              rounded-xl
              bg-gray-200
              px-5
              py-3
            "
          >
            取消
          </button>

          <button
            onClick={handleSave}
            className="
              rounded-xl
              bg-blue-500
              px-5
              py-3
              text-white
            "
          >
            {isEdit ? "儲存" : "新增"}
          </button>

        </div>

      </div>

    </div>

  );

}