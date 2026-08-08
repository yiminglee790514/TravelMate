export default function HotelCard({
  hotel,
  onEdit,
  onDelete,
  onCopy,
  readonly = false,
}) {

  const nights =
    hotel.checkIn && hotel.checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(hotel.checkOut) -
              new Date(hotel.checkIn)) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

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

  // 舊資料沒有 currency
  // 預設台幣
  const currency =
    currencyMap[hotel.currency] ||
    currencyMap.TWD;

  return (

    <div className="rounded-2xl bg-white p-5 shadow">

      {/* =========================
          標題
      ========================= */}

      <div className="flex items-start justify-between">

        <div className="break-words text-xl font-semibold">
          🏨 {hotel.name}
        </div>

        {!readonly && (

          <div className="flex gap-1">

            {/* 編輯 */}

            <button
              onClick={onEdit}
              className="
                rounded-lg
                p-1.5
                text-base
                text-gray-400
                transition
                hover:bg-blue-100
                hover:text-blue-500
              "
              title="編輯"
            >
              ✏️
            </button>

            {/* 複製 */}

            <button
              onClick={onCopy}
              className="
                rounded-lg
                p-1.5
                text-base
                text-gray-400
                transition
                hover:bg-green-100
                hover:text-green-500
              "
              title="複製"
            >
              📋
            </button>

            {/* 刪除 */}

            <button
              onClick={onDelete}
              className="
                rounded-lg
                p-1.5
                text-base
                text-gray-400
                transition
                hover:bg-red-100
                hover:text-red-500
              "
              title="刪除"
            >
              🗑️
            </button>

          </div>

        )}

      </div>


      {/* =========================
          日期
      ========================= */}

      <div className="mt-4 text-sm text-gray-600">
        📅 {hotel.checkIn || "--"} → {hotel.checkOut || "--"}
      </div>

      {nights > 0 && (

        <div className="mt-1 text-sm text-indigo-600">
          🌙 {nights} 晚
        </div>

      )}


      {/* =========================
          訂位姓名
      ========================= */}

      {hotel.bookingName && (

        <div className="mt-4 rounded-xl bg-blue-50 p-3">

          <div className="text-xs text-gray-500">
            訂位姓名
          </div>

          <div className="mt-1 font-semibold text-gray-800">
            👤 {hotel.bookingName}
          </div>

        </div>

      )}


      {/* =========================
          房型
      ========================= */}

      {hotel.roomType && (

        <div className="mt-3 text-sm text-gray-700">

          🛏️

          <span className="ml-1 font-medium">
            房型：
          </span>

          {hotel.roomType}

        </div>

      )}


      {/* =========================
          入住 / 退房時間
      ========================= */}

      {(hotel.checkInTime || hotel.checkOutTime) && (

        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">

          {hotel.checkInTime && (

            <div>
              🕒

              <span className="font-medium">
                Check in：
              </span>

              {hotel.checkInTime}
            </div>

          )}

          {hotel.checkOutTime && (

            <div className="mt-1">
              🕚

              <span className="font-medium">
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

        <div className="mt-3 text-sm text-indigo-600">
          🏷 {hotel.booking}
        </div>

      )}


      {/* =========================
          訂房編號
      ========================= */}

      {hotel.confirmation && (

        <div className="mt-1 text-sm text-gray-600">
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
            {Number(hotel.price).toLocaleString()}

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