export default function TimelineItem({
  time,
  title,
  icon,
  address,
  note,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex items-center gap-4 py-4">

      {/* 時間 */}
      <div className="w-12 text-right">

        <div className="font-semibold text-gray-700">
          {time}
        </div>

      </div>

      {/* Timeline */}
      <div className="flex flex-col items-center justify-start pt-2">

        <div className="h-4 w-4 rounded-full bg-blue-500"></div>

        <div className="h-full w-[2px] bg-gray-300"></div>

      </div>

      {/* 內容 */}
      <div className="flex-1">

        <div className="text-[18px] font-semibold leading-tight">
          {icon} {title}
        </div>

        {address && (
          <div className="mt-3">

            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Address
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-sm text-blue-600 hover:underline"
            >
              📍 {address}
            </a>

          </div>
        )}

        {note && (
          <div className="mt-3">

            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Note
            </div>

            <div className="mt-1 rounded-xl bg-yellow-50 p-3 text-sm text-gray-700">
              📝 {note}
            </div>

          </div>
        )}

      </div>

      {/* 操作按鈕 */}
      <div className="flex shrink-0 items-center gap-1">

        <button
          onClick={onEdit}
          className="rounded-lg p-1.5 text-xl transition hover:bg-blue-100"
          title="修改"
        >
          ✏️
        </button>

        <button
          onClick={onDelete}
          className="rounded-lg p-1.5 text-lg transition hover:bg-red-100"
          title="刪除"
        >
          🗑️
        </button>

      </div>

    </div>
  );
}