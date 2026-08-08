import { useEffect, useRef, useState } from "react";

export default function HotelCard({
  hotel,
  onEdit,
  onDelete,
  onCopy,
  readonly = false,
}) {

  const [showMenu, setShowMenu] =
    useState(false);

  const menuRef = useRef(null);


  const nights =
    hotel.checkIn &&
    hotel.checkOut
      ? Math.max(
          0,
          Math.round(
            (
              new Date(
                hotel.checkOut
              ) -
              new Date(
                hotel.checkIn
              )
            ) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;


  // =========================
  // 點其他地方收起選單
  // =========================

  useEffect(() => {

    function handleOutsideClick(e) {

      if (
        menuRef.current &&
        !menuRef.current.contains(
          e.target
        )
      ) {

        setShowMenu(false);

      }

    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, []);


  // =========================
  // 幣別
  // =========================

  const currencyMap = {

    JPY: {
      symbol: "¥",
      name: "日圓",
    },

    TWD: {
      symbol: "NT$",
      name: "台幣",
    },

    USD: {
      symbol: "$",
      name: "美元",
    },

    HKD: {
      symbol: "HK$",
      name: "港幣",
    },

    KRW: {
      symbol: "₩",
      name: "韓元",
    },

    CNY: {
      symbol: "¥",
      name: "人民幣",
    },

    EUR: {
      symbol: "€",
      name: "歐元",
    },

    GBP: {
      symbol: "£",
      name: "英鎊",
    },

    SGD: {
      symbol: "S$",
      name: "新加坡幣",
    },

    THB: {
      symbol: "฿",
      name: "泰銖",
    },

  };


  const currency =
    currencyMap[
      hotel.currency
    ] ||
    currencyMap.TWD;


  return (

    <div className="
      rounded-2xl
      border
      border-gray-100
      bg-white
      p-4
      shadow-sm
    ">


      {/* =========================
          頂部
      ========================= */}

      <div className="
        flex
        items-center
        justify-between
      ">

        <div className="
          text-sm
          font-semibold
          text-gray-500
        ">
          🛏️ 住宿資料
        </div>


        {!readonly && (

          <div
            ref={menuRef}
            className="relative"
          >

            <button
              type="button"
              onClick={() =>
                setShowMenu(
                  (prev) => !prev
                )
              }
              className="
                rounded-lg
                px-2
                py-1
                text-xl
                font-bold
                leading-none
                text-gray-500
                hover:bg-gray-100
              "
            >
              ⋯
            </button>


            {showMenu && (

              <div className="
                absolute
                right-0
                top-full
                z-40
                mt-1
                w-28
                overflow-hidden
                rounded-xl
                bg-white
                shadow-xl
                ring-1
                ring-black/5
              ">

                <button
                  type="button"
                  onClick={() => {

                    setShowMenu(false);

                    onEdit();

                  }}
                  className="
                    w-full
                    px-4
                    py-3
                    text-left
                    text-sm
                    hover:bg-gray-100
                  "
                >
                  ✏️ 編輯
                </button>


                <button
                  type="button"
                  onClick={() => {

                    setShowMenu(false);

                    onCopy();

                  }}
                  className="
                    w-full
                    px-4
                    py-3
                    text-left
                    text-sm
                    hover:bg-gray-100
                  "
                >
                  📋 複製
                </button>


                <button
                  type="button"
                  onClick={() => {

                    setShowMenu(false);

                    onDelete();

                  }}
                  className="
                    w-full
                    px-4
                    py-3
                    text-left
                    text-sm
                    text-red-600
                    hover:bg-red-50
                  "
                >
                  🗑️ 刪除
                </button>

              </div>

            )}

          </div>

        )}

      </div>


      {/* =========================
          日期
      ========================= */}

      <div className="
        mt-3
        text-sm
        text-gray-600
      ">
        📅 {hotel.checkIn || "--"}
        {" → "}
        {hotel.checkOut || "--"}
      </div>


      {nights > 0 && (

        <div className="
          mt-1
          text-sm
          text-indigo-600
        ">
          🌙 {nights} 晚
        </div>

      )}


      {/* =========================
          訂位姓名
      ========================= */}

      {hotel.bookingName && (

        <div className="
          mt-4
          rounded-xl
          bg-blue-50
          p-3
        ">

          <div className="
            text-xs
            text-gray-500
          ">
            訂位姓名
          </div>

          <div className="
            mt-1
            font-semibold
            text-gray-800
          ">
            👤 {hotel.bookingName}
          </div>

        </div>

      )}


      {/* =========================
          房型
      ========================= */}

      {hotel.roomType && (

        <div className="
          mt-3
          text-sm
          text-gray-700
        ">

          🛏️

          <span className="
            ml-1
            font-medium
          ">
            房型：
          </span>

          {hotel.roomType}

        </div>

      )}


      {/* =========================
          入住 / 退房
      ========================= */}

      {(hotel.checkInTime ||
        hotel.checkOutTime) && (

        <div className="
          mt-3
          rounded-xl
          bg-slate-50
          p-3
          text-sm
        ">

          {hotel.checkInTime && (

            <div>
              🕒

              <span className="
                font-medium
              ">
                Check in：
              </span>

              {hotel.checkInTime}
            </div>

          )}


          {hotel.checkOutTime && (

            <div className="mt-1">

              🕚

              <span className="
                font-medium
              ">
                Check out：
              </span>

              {hotel.checkOutTime}

            </div>

          )}

        </div>

      )}


      {/* =========================
          訂房平台
      ========================= */}

      {hotel.booking && (

        <div className="
          mt-3
          text-sm
          text-indigo-600
        ">
          🏷 {hotel.booking}
        </div>

      )}


      {/* =========================
          訂房編號
      ========================= */}

      {hotel.confirmation && (

        <div className="
          mt-1
          text-sm
          text-gray-600
        ">
          🔑 {hotel.confirmation}
        </div>

      )}


      {/* =========================
          地址
      ========================= */}

      {hotel.address && (

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            hotel.address
          )}`}
          target="_blank"
          rel="noreferrer"
          className="
            mt-4
            block
            break-words
            text-sm
            text-blue-600
            hover:underline
          "
        >
          📍 {hotel.address}
        </a>

      )}


      {/* =========================
          官網
      ========================= */}

      {hotel.website && (

        <a
          href={hotel.website}
          target="_blank"
          rel="noreferrer"
          className="
            mt-2
            block
            break-words
            text-sm
            text-green-600
            hover:underline
          "
        >
          🌐 官方網站
        </a>

      )}


      {/* =========================
          價格
      ========================= */}

      {hotel.price !== "" &&
        hotel.price !== null &&
        hotel.price !== undefined && (

        <div className="
          mt-4
          text-lg
          font-semibold
          text-emerald-600
        ">

          💰 {currency.symbol}
          {Number(
            hotel.price
          ).toLocaleString()}

          <span className="
            ml-2
            text-sm
            font-normal
            text-gray-500
          ">
            {currency.name}
          </span>

        </div>

      )}


      {/* =========================
          備註
      ========================= */}

      {hotel.note && (

        <div className="
          mt-4
          rounded-xl
          bg-yellow-50
          p-3
          text-sm
          text-gray-700
        ">
          📝 {hotel.note}
        </div>

      )}

    </div>

  );

}