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
    <div className="py-5">

      {/* 第一行：時間 + 操作 */}
      <div className="mb-4 flex items-center justify-between">

        <div className="text-lg font-semibold text-gray-700">
          {time}
        </div>

        <div className="flex items-center gap-1">

          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-lg transition hover:bg-blue-100"
            title="修改"
          >
            ✏️
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-lg transition hover:bg-red-100"
            title="刪除"
          >
            🗑️
          </button>

        </div>

      </div>

      {/* 第二行：Timeline + 內容 */}
      <div className="flex gap-4">

        {/* Timeline */}
        <div className="flex flex-col items-center">

          <div className="mt-2 h-4 w-4 rounded-full bg-blue-500"></div>

          <div className="mt-2 h-full w-[2px] bg-gray-300"></div>

        </div>

        {/* 內容 */}
        <div className="min-w-0 flex-1">

          <div className="text-2xl font-bold break-words">
            {icon} {title}
          </div>

          {address && (
            <div className="mt-4">

              <div className="text-xs font-semibold text-gray-400">
                📍 地址
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block text-sm text-blue-600 hover:underline"
              >
                {address}
              </a>

            </div>
          )}

          {note && (
            <div className="mt-4">

              <div className="text-xs font-semibold text-gray-400">
                📝 備註
              </div>

              <div className="mt-1 rounded-xl bg-yellow-50 p-3 text-sm text-gray-700">
                {note}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}