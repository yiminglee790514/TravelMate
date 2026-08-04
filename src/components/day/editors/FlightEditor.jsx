export default function FlightEditor({
  extra,
  setExtra,
}) {

  function update(field, value) {
    setExtra({
      ...extra,
      [field]: value,
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border bg-blue-50 p-4">

      <h3 className="font-bold text-blue-700">
        ✈️ 航班資訊
      </h3>

      <input
        className="w-full rounded-xl border p-3"
        placeholder="航空公司（例如：中華航空）"
        value={extra.airline || ""}
        onChange={(e) =>
          update("airline", e.target.value)
        }
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="航班號（例如：CI919）"
        value={extra.flightNo || ""}
        onChange={(e) =>
          update("flightNo", e.target.value)
        }
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="出發機場（例如：TPE）"
        value={extra.departure || ""}
        onChange={(e) =>
          update("departure", e.target.value)
        }
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="抵達機場（例如：HKG）"
        value={extra.arrival || ""}
        onChange={(e) =>
          update("arrival", e.target.value)
        }
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="座位（例如：32A）"
        value={extra.seat || ""}
        onChange={(e) =>
          update("seat", e.target.value)
        }
      />

    </div>
  );
}