import FlightList from "./FlightList";

export default function FlightCard({
  title,
  flights = [],
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  readonly = false,
}) {

  const list = Array.isArray(flights)
    ? flights
    : flights
    ? [flights]
    : [];

  if (list.length === 0) {

    return (

      <div className="rounded-2xl bg-white p-6 shadow">

        <div className="mb-5 flex items-center justify-between">

          <div className="text-2xl font-bold">
            {title}
          </div>

          {!readonly && (

            <button
              onClick={onAdd}
              className="rounded-xl bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              ＋新增航段
            </button>

          )}

        </div>

        <div className="py-12 text-center text-gray-400">
          尚未建立航班
        </div>

      </div>

    );

  }

  return (

    <div>

      <div className="mb-5 flex items-center justify-between">

        <div className="text-2xl font-bold">
          {title}
        </div>

        {!readonly && (

          <button
            onClick={onAdd}
            className="rounded-xl bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            ＋新增航段
          </button>

        )}

      </div>

      <FlightList
        flights={list}
        readonly={readonly}
        onEdit={onEdit}
        onDelete={onDelete}
        onReorder={onReorder}
      />

    </div>

  );

}
