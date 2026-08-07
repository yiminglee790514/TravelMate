export default function TimelineItem({
  item,
  time,
  title,
  icon,
  address,
  note,
  onEdit,
  onDelete,
  readonly = false,
  owner = false,
}) {

  // 支援兩種傳法：
  // <TimelineItem time="" title="" ... />
  if (item) {

    time = item.time;
    title = item.title;
    icon = item.icon;
    address = item.address;
    note = item.note;

  }

  return (

    <div className="py-4">

      {/* 第一行：時間 + 操作 */}
      <div className="mb-3 flex items-center justify-between">

        <div className="text-base font-semibold text-gray-700">
          {time}
        </div>

        {!readonly && (

          <div className="flex items-center gap-1">

            {/* 修改：Owner、Editor 都可以 */}
            <button
              onClick={onEdit}
              className="rounded-lg p-1.5 text-base text-gray-400 transition hover:bg-blue-100 hover:text-blue-500"
              title="修改"
            >
              ✏️
            </button>

            {/* 刪除：只有 Owner 可以 */}
            <button
              onClick={onDelete}
              className="rounded-lg p-1.5 text-base text-gray-400 transition hover:bg-red-100 hover:text-red-500"
              title="刪除"
            >
              🗑️
            </button>

          </div>

        )}

      </div>

      {/* 第二行：Timeline + 內容 */}
      <div className="flex gap-4">

        {/* Timeline */}
        <div className="flex flex-col items-center">

          <div className="mt-2 h-3 w-3 rounded-full bg-blue-500"></div>

          <div className="mt-2 h-full w-[2px] bg-gray-300"></div>

        </div>

        {/* 內容 */}
        <div className="min-w-0 flex-1">

          <div className="break-words text-xl font-semibold">
            {icon} {title}
          </div>

          {address && (

            <div className="mt-3">

              <div className="text-[11px] font-semibold text-gray-400">
                📍 地址
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block break-words text-xs leading-5 text-blue-600 hover:underline"
              >
                {address}
              </a>

            </div>

          )}

          {note && (

            <div className="mt-3">

              <div className="text-[11px] font-semibold text-gray-400">
                📝 備註
              </div>

              <div className="mt-1 rounded-xl bg-yellow-50 p-3 text-xs leading-5 text-gray-700">
                {note}
              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}