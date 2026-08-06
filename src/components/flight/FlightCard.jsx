export default function FlightCard({
  title,
  flight,
  onAdd,
  onEdit,
  readonly = false,
}) {

  if (!flight) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-lg">

        <div className="text-2xl font-bold">
          {title}
        </div>

        <div className="mt-6 text-center text-gray-400">
          尚未建立航班
        </div>

        <button
          onClick={onAdd}
          className="mt-6 w-full rounded-2xl bg-blue-500 py-3 font-semibold text-white hover:bg-blue-600"
        >
          ＋ 建立航班
        </button>

      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">

      <div className="flex items-center justify-between">

        <div className="text-2xl font-bold">
          {title}
        </div>

        {!readonly && (

        <button
            onClick={onEdit}
        >
            ✏️
        </button>

        )}

      </div>

        <div className="mt-6 flex items-start justify-between">

        <div>

            <div className="text-lg font-bold">
            ✈️ {flight.airline}
            </div>

            

        </div>

        <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600">
        {flight.flightNo}
        </div>

        </div>

<div className="my-8">

  <div className="flex items-end justify-between">

    <div className="text-center">

      <div className="text-4xl font-bold tracking-tight">
        {flight.departure.time}
      </div>

      <div className="mt-2 text-xl font-semibold tracking-widest">
        {flight.departure.code}
      </div>

      <div
        className="mt-1 max-w-[120px] truncate text-sm text-gray-500"
        title={flight.departure.name}
        >
        {flight.departure.name}
        </div>

    </div>

    <div className="flex flex-1 items-center px-4">

      <div className="h-px flex-1 bg-gray-300"></div>

      <div className="mx-3 text-2xl text-blue-500">
        ✈️
      </div>

      <div className="h-px flex-1 bg-gray-300"></div>

    </div>

    <div className="text-center">

      <div className="text-3xl font-bold">
        {flight.arrival.time}
      </div>

      <div className="mt-2 text-2xl font-bold">
        {flight.arrival.code}
      </div>

      <div
        className="mt-1 max-w-[120px] truncate text-sm text-gray-500"
        title={flight.arrival.name}
        >
        {flight.arrival.name}
        </div>

    </div>

  </div>

</div>

      <div className="grid grid-cols-3 gap-3 rounded-2xl border bg-gray-50 p-4">

        <div>

          <div className="text-xs text-gray-500">
            Seat
          </div>

          <div className="font-bold">
            {flight.seat || "--"}
          </div>

        </div>

        <div>

          <div className="text-xs text-gray-500">
            Gate
          </div>

          <div className="font-bold">
            {flight.gate || "--"}
          </div>

        </div>

        <div>

          <div className="text-xs text-gray-500">
            Terminal
          </div>

          <div className="font-bold">
            {flight.terminal || "--"}
          </div>

        </div>

      </div>

    </div>
  );
}