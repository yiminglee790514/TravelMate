import { useState } from "react";

const CURRENCIES = [
  {
    code: "JPY",
    name: "日圓",
    symbol: "¥",
  },
  {
    code: "TWD",
    name: "台幣",
    symbol: "NT$",
  },
  {
    code: "USD",
    name: "美元",
    symbol: "$",
  },
  {
    code: "HKD",
    name: "港幣",
    symbol: "HK$",
  },
  {
    code: "KRW",
    name: "韓元",
    symbol: "₩",
  },
  {
    code: "CNY",
    name: "人民幣",
    symbol: "¥",
  },
  {
    code: "EUR",
    name: "歐元",
    symbol: "€",
  },
  {
    code: "GBP",
    name: "英鎊",
    symbol: "£",
  },
  {
    code: "SGD",
    name: "新加坡幣",
    symbol: "S$",
  },
  {
    code: "THB",
    name: "泰銖",
    symbol: "฿",
  },
];

export default function HotelModal({
  hotel,
  onClose,
  onSave,
  copyMode = false,
  hotelGroups = [],
  currentGroupId = "",
  people = [],
  onAddPerson,
}) {

  const isEdit =
    !!hotel && !copyMode;


  // =========================
  // 目標群組
  // =========================

  const [targetGroupId, setTargetGroupId] =
    useState(
      currentGroupId || ""
    );


  const currentGroup =
    hotelGroups.find(
      (group) =>
        group.id === targetGroupId
    );


  // =========================
  // 飯店資料
  // =========================

  const [checkIn, setCheckIn] =
    useState(
      hotel?.checkIn || ""
    );

  const [checkOut, setCheckOut] =
    useState(
      hotel?.checkOut || ""
    );

  const [checkInTime, setCheckInTime] =
    useState(
      hotel?.checkInTime || ""
    );

  const [checkOutTime, setCheckOutTime] =
    useState(
      hotel?.checkOutTime || ""
    );

  const [address, setAddress] =
    useState(
      hotel?.address || ""
    );

  const [phone, setPhone] =
    useState(
      hotel?.phone || ""
    );

  const [website, setWebsite] =
    useState(
      hotel?.website || ""
    );

  const [booking, setBooking] =
    useState(
      hotel?.booking || ""
    );

  const [confirmation, setConfirmation] =
    useState(
      hotel?.confirmation || ""
    );

  const [bookingName, setBookingName] =
    useState(
      hotel?.bookingName || ""
    );

  const [newPerson, setNewPerson] = useState("");
  const [showPersonInput, setShowPersonInput] = useState(false);

  const [roomType, setRoomType] =
    useState(
      hotel?.roomType || ""
    );

  const [price, setPrice] =
    useState(
      hotel?.price || ""
    );

  const [currency, setCurrency] =
    useState(
      hotel?.currency || ""
    );

  const [note, setNote] =
    useState(
      hotel?.note || ""
    );


  // =========================
  // 儲存
  // =========================

  function handleAddPerson() {

    const name = newPerson.trim();

    if (!name) return;

    if (people.includes(name)) {

      setBookingName(name);
      setNewPerson("");
      setShowPersonInput(false);

      return;

    }

    if (onAddPerson) {
      onAddPerson(name);
    }

    setBookingName(name);
    setNewPerson("");
    setShowPersonInput(false);

  }


  function handleSave() {

    if (!targetGroupId) {

      alert(
        "請選擇住宿群組"
      );

      return;

    }


    if (
      !currency &&
      price
    ) {

      alert(
        "請選擇價格幣別"
      );

      return;

    }


    // =========================
    // 群組名稱就是飯店名稱
    // =========================

    const hotelName =
      currentGroup?.title ||
      hotel?.name ||
      "";


    onSave(

      {

        id:
          copyMode
            ? Date.now()
            : (
                hotel?.id ||
                Date.now()
              ),

        name:
          hotelName,

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

      },

      targetGroupId

    );

  }


  return (

    <div className="
      fixed
      inset-0
      z-[100]
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

        <div className="
          shrink-0
          px-5
          pt-5
          sm:px-8
          sm:pt-7
        ">

          <h2 className="
            text-xl
            font-bold
            sm:text-2xl
          ">

            {copyMode
              ? "複製住宿"
              : isEdit
                ? "修改飯店"
                : "新增飯店"}

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
                複製到哪個群組
            ========================= */}

            {copyMode && (

              <div>

                <label className="
                  mb-1
                  block
                  text-xs
                  font-medium
                  text-gray-600
                  sm:text-sm
                ">
                  複製到住宿群組
                </label>

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
                  value={targetGroupId}
                  onChange={(e) =>
                    setTargetGroupId(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    請選擇住宿群組
                  </option>

                  {hotelGroups.map(
                    (group) => (

                      <option
                        key={group.id}
                        value={group.id}
                      >
                        {group.title}
                      </option>

                    )
                  )}

                </select>

              </div>

            )}


            {/* =========================
                目前群組
            ========================= */}

            {!copyMode && (

              <div className="
                rounded-xl
                bg-gray-50
                px-3
                py-2.5
                text-sm
                text-gray-600
              ">

                🏨

                <span className="
                  ml-1
                  font-semibold
                  text-gray-800
                ">
                  {currentGroup?.title ||
                    hotel?.name ||
                    "住宿群組"}
                </span>

              </div>

            )}


                {/* =========================
                    入住日期 / 時間
                ========================= */}

                <div className="
                mx-auto
                grid
                w-full
                max-w-[360px]
                grid-cols-2
                gap-3
                ">

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
                        w-full
                        min-w-0
                        rounded-xl
                        border
                        px-3
                        py-3
                        text-base
                        leading-normal
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
                        w-full
                        min-w-0
                        rounded-xl
                        border
                        px-3
                        py-3
                        text-base
                        leading-normal
                    "
                    value={checkInTime}
                    onChange={(e) =>
                        setCheckInTime(e.target.value)
                    }
                    />

                </div>

                </div>


                {/* =========================
                    退房日期 / 時間
                ========================= */}

                <div className="
                mx-auto
                grid
                w-full
                max-w-[360px]
                grid-cols-2
                gap-3
                ">

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
                        w-full
                        min-w-0
                        rounded-xl
                        border
                        px-3
                        py-3
                        text-base
                        leading-normal
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
                        w-full
                        min-w-0
                        rounded-xl
                        border
                        px-3
                        py-3
                        text-base
                        leading-normal
                    "
                    value={checkOutTime}
                    onChange={(e) =>
                        setCheckOutTime(e.target.value)
                    }
                    />

                </div>

                </div>


            {/* =========================
                訂位／付款人
            ========================= */}

            <div>

              <label className="
                mb-1
                block
                text-xs
                font-medium
                text-gray-600
                sm:text-sm
              ">
                訂位／付款人
              </label>

              <div className="flex gap-2">

                <select
                  className="
                    min-w-0
                    flex-1
                    rounded-xl
                    border
                    px-3
                    py-2.5
                    text-[15px]
                    sm:p-3
                    sm:text-base
                  "
                  value={bookingName}
                  onChange={(e) =>
                    setBookingName(e.target.value)
                  }
                >

                  <option value="">
                    請選擇訂位／付款人
                  </option>

                  {people.map((person) => (

                    <option
                      key={person}
                      value={person}
                    >
                      {person}
                    </option>

                  ))}

                  {/* 保留舊資料中可能存在、但尚未在 people 名單的人名 */}
                  {bookingName &&
                    !people.includes(bookingName) && (

                      <option value={bookingName}>
                        {bookingName}
                      </option>

                    )}

                </select>

                <button
                  type="button"
                  onClick={() =>
                    setShowPersonInput(
                      (value) => !value
                    )
                  }
                  className="
                    shrink-0
                    rounded-xl
                    bg-gray-100
                    px-3
                    text-sm
                    font-semibold
                    text-gray-700
                    hover:bg-gray-200
                  "
                >
                  ＋人名
                </button>

              </div>

              {showPersonInput && (

                <div className="mt-2 flex gap-2">

                  <input
                    autoFocus
                    className="
                      min-w-0
                      flex-1
                      rounded-xl
                      border
                      px-3
                      py-2.5
                      text-sm
                    "
                    placeholder="輸入人名"
                    value={newPerson}
                    onChange={(e) =>
                      setNewPerson(e.target.value)
                    }
                    onKeyDown={(e) => {

                      if (e.key === "Enter") {
                        handleAddPerson();
                      }

                    }}
                  />

                  <button
                    type="button"
                    onClick={handleAddPerson}
                    className="
                      rounded-xl
                      bg-blue-500
                      px-4
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    新增
                  </button>

                </div>

              )}

            </div>


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
                setRoomType(
                  e.target.value
                )
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
                setAddress(
                  e.target.value
                )
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
                setPhone(
                  e.target.value
                )
              }
            />


            {/* =========================
                官網
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
                setWebsite(
                  e.target.value
                )
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
                setBooking(
                  e.target.value
                )
              }
            >

              <option value="">
                訂房平台
              </option>

              <option>
                Agoda
              </option>

              <option>
                Booking.com
              </option>

              <option>
                Trip.com
              </option>

              <option>
                Hotels.com
              </option>

              <option>
                Expedia
              </option>

              <option>
                Airbnb
              </option>

              <option>
                Rakuten
              </option>

              <option>
                官方網站
              </option>

              <option>
                其他
              </option>

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
                setConfirmation(
                  e.target.value
                )
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
                  setPrice(
                    e.target.value
                  )
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
                setCurrency(
                  e.target.value
                )
              }
            >

              <option value="">
                請選擇幣別
              </option>

              {CURRENCIES.map(
                (item) => (

                  <option
                    key={item.code}
                    value={item.code}
                  >
                    {item.code}｜
                    {item.name}{" "}
                    {item.symbol}
                  </option>

                )
              )}

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
                setNote(
                  e.target.value
                )
              }
            />

          </div>

        </div>


        {/* =========================
            底部按鈕
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
            {copyMode
              ? "複製"
              : isEdit
                ? "儲存"
                : "新增"}
          </button>

        </div>

      </div>

    </div>

  );

}