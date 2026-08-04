export default function TimelineItem({
  time,
  title,
  icon,
  onDelete,
}) {
  return (
    <div className="flex items-center gap-4 py-4">

      <div className="w-16 text-right">

        <div className="font-semibold">
          {time}
        </div>

      </div>

      <div className="flex flex-col items-center">

        <div className="h-4 w-4 rounded-full bg-blue-500"></div>

        <div className="h-full w-[2px] bg-gray-300"></div>

      </div>

      <div className="flex-1">

        <div className="text-xl">
          {icon} {title}
        </div>

      </div>

      <button
        onClick={onDelete}
        className="rounded-lg p-2 text-xl hover:bg-red-100"
        title="刪除"
      >
        🗑️
      </button>

    </div>
  );
}