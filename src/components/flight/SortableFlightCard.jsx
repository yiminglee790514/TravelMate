import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableFlightCard({
  segment,
  index,
  readonly,
  onEdit,
  onDelete,
}) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: segment.id || `flight-${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 航班日期格式
  function formatFlightDate(date) {

    if (!date) return "未設定日期";

    const d = new Date(`${date}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
      return "未設定日期";
    }

    const weekdays = [
      "週日",
      "週一",
      "週二",
      "週三",
      "週四",
      "週五",
      "週六",
    ];

    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
  }

  return (

    <div
      ref={setNodeRef}
      style={style}
      className="mb-6 rounded-2xl border bg-white p-5 shadow-sm"
    >

      {/* 標題 */}

      <div className="mb-3 flex items-center justify-between">

        <div
          className="flex cursor-grab items-center gap-2 text-lg font-bold"
          {...attributes}
          {...listeners}
        >
          ☰ 第 {index + 1} 段
        </div>

        {!readonly && (

          <div className="flex gap-2">

            <button
              onClick={() => onEdit(segment)}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              ✏️
            </button>

            <button
              onClick={() => onDelete(segment.id)}
              className="rounded-lg p-2 hover:bg-red-100"
            >
              🗑️
            </button>

          </div>

        )}

      </div>

      {/* 航班日期 */}

      <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3">

        <span className="text-lg">
          📅
        </span>

        <span className="font-semibold text-blue-700">
          {formatFlightDate(segment.date)}
        </span>

      </div>

      {/* 航空公司 / 航班號 */}

      <div className="mb-3 flex items-start justify-between">

        <div>

          <div className="text-lg font-bold">
            ✈️ {segment.airline}
          </div>

        </div>

        <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600">
          {segment.flightNo}
        </div>

      </div>

      {/* 出發 / 抵達 */}

      <div className="flex items-center justify-between">

        <div className="text-center">

          <div className="text-3xl font-bold">
            {segment.departure?.time || "--"}
          </div>

          <div className="mt-2 text-xl font-bold">
            {segment.departure?.code || "--"}
          </div>

          <div className="mt-1 text-sm text-gray-500">
            {segment.departure?.name || "--"}
          </div>

        </div>

        <div className="px-4 text-2xl text-blue-500">
          ✈️
        </div>

        <div className="text-center">

          <div className="text-3xl font-bold">
            {segment.arrival?.time || "--"}
          </div>

          <div className="mt-2 text-xl font-bold">
            {segment.arrival?.code || "--"}
          </div>

          <div className="mt-1 text-sm text-gray-500">
            {segment.arrival?.name || "--"}
          </div>

        </div>

      </div>

      {/* Seat / Gate / Terminal */}

      <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl border bg-gray-50 p-4">

        <div>

          <div className="text-xs text-gray-500">
            Seat
          </div>

          <div className="font-bold">
            {segment.seat || "--"}
          </div>

        </div>

        <div>

          <div className="text-xs text-gray-500">
            Gate
          </div>

          <div className="font-bold">
            {segment.gate || "--"}
          </div>

        </div>

        <div>

          <div className="text-xs text-gray-500">
            Terminal
          </div>

          <div className="font-bold">
            {segment.terminal || "--"}
          </div>

        </div>

      </div>

    </div>

  );

}