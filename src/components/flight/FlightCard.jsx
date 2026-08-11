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
  const list = Array.isArray(flights) ? flights : flights ? [flights] : [];

  return (
    <section className="tm-flight-section">
      {list.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white px-5 py-14 text-center shadow-sm">
          <div className="mb-2 text-4xl">✈️</div>
          <div className="text-sm font-semibold text-gray-500">
            尚未建立{title}航班
          </div>

          {!readonly && (
            <button
              type="button"
              onClick={onAdd}
              className="mt-5 rounded-xl border border-dashed border-blue-300 px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              ＋ 新增航段
            </button>
          )}
        </div>
      ) : (
        <>
          <FlightList
            flights={list}
            readonly={readonly}
            onEdit={onEdit}
            onDelete={onDelete}
            onReorder={onReorder}
          />

          {!readonly && (
            <button
              type="button"
              onClick={onAdd}
              className="tm-flight-add-button"
            >
              ＋ 新增航段
            </button>
          )}
        </>
      )}
    </section>
  );
}
