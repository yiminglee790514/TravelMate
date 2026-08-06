export default function TransportCard({
  transport,
  onEdit,
  onDelete,
  readonly = false,
}) {

  return (

    <div className="rounded-2xl bg-white p-5 shadow">

      {/* 標題 */}
      <div className="flex items-start justify-between">

        <div>

          <div className="text-xl font-semibold">
            {transport.type}
          </div>

          <div className="mt-1 text-lg font-medium">
            {transport.company}
          </div>

        </div>

        {!readonly && (

          <div className="flex gap-1">

            <button
              onClick={onEdit}
              className="rounded-lg p-1.5 text-base text-gray-400 transition hover:bg-blue-100 hover:text-blue-500"
            >
              ✏️
            </button>

            <button
              onClick={onDelete}
              className="rounded-lg p-1.5 text-base text-gray-400 transition hover:bg-red-100 hover:text-red-500"
            >
              🗑️
            </button>

          </div>

        )}

      </div>

      {/* 路線 */}
      {(transport.from || transport.to) && (

        <div className="mt-4 text-base font-medium">

          📍 {transport.from} → {transport.to}

        </div>

      )}

      {/* 日期 */}
      {(transport.departureDate || transport.arrivalDate) && (

        <div className="mt-3 text-sm text-gray-600">

          📅 {transport.departureDate}

          {transport.arrivalDate &&
            transport.arrivalDate !== transport.departureDate &&
            ` → ${transport.arrivalDate}`}

        </div>

      )}

      {/* 時間 */}
      {(transport.departureTime || transport.arrivalTime) && (

        <div className="mt-2 rounded-xl bg-slate-50 p-3">

          <div className="flex justify-between text-sm">

            <span>🕒 出發</span>

            <span className="font-medium">
              {transport.departureTime || "--:--"}
            </span>

          </div>

          <div className="mt-2 flex justify-between text-sm">

            <span>🕚 抵達</span>

            <span className="font-medium">
              {transport.arrivalTime || "--:--"}
            </span>

          </div>

        </div>

      )}

      {/* 價格 */}
      {transport.price && (

        <div className="mt-4 text-lg font-semibold text-emerald-600">

          💰 {Number(transport.price).toLocaleString()}

        </div>

      )}

      {/* 網站 */}
      {transport.website && (

        <a
          href={transport.website}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block text-sm text-green-600 hover:underline"
        >
          🌐 官方網站
        </a>

      )}

      {/* 備註 */}
      {transport.note && (

        <div className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm text-gray-700">

          📝 {transport.note}

        </div>

      )}

    </div>

  );

}