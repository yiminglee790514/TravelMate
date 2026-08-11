import { useState } from "react";

const CURRENCIES = [
  ["JPY", "¥"],
  ["TWD", "NT$"],
  ["USD", "$"],
  ["HKD", "HK$"],
  ["KRW", "₩"],
  ["CNY", "¥"],
  ["EUR", "€"],
];

export default function FlightPassengerEditor({
  passengers = [],
  people = [],
  onChange,
  onAddPerson,
}) {
  const list = Array.isArray(passengers) ? passengers : [];
  const personList = Array.isArray(people) ? people : [];

  const [selectedName, setSelectedName] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("JPY");
  const [seat, setSeat] = useState("");
  const [baggageKg, setBaggageKg] = useState("");
  const [showNewPerson, setShowNewPerson] = useState(false);
  const [personInput, setPersonInput] = useState("");

  function addPassenger() {
    const name = selectedName.trim();
    if (!name) {
      alert("請選擇旅客");
      return;
    }

    if (list.some((passenger) => passenger.name === name)) {
      alert("這位旅客已經加入");
      return;
    }

    onChange([
      ...list,
      {
        id: Date.now(),
        name,
        price: price === "" ? "" : Number(price),
        currency,
        seat: seat.trim(),
        baggageKg: baggageKg === "" ? "" : Number(baggageKg),
      },
    ]);

    setSelectedName("");
    setPrice("");
    setSeat("");
    setBaggageKg("");
  }

  async function handleAddPerson() {
    const name = personInput.trim();
    if (!name) return;

    if (personList.includes(name)) {
      alert("這個名字已經存在");
      return;
    }

    await onAddPerson?.(name);
    setSelectedName(name);
    setPersonInput("");
    setShowNewPerson(false);
  }

  function removePassenger(id) {
    onChange(list.filter((passenger) => passenger.id !== id));
  }

  function updatePassenger(id, field, value) {
    onChange(
      list.map((passenger) =>
        passenger.id === id
          ? {
              ...passenger,
              [field]:
                (field === "price" || field === "baggageKg") && value !== ""
                  ? Number(value)
                  : value,
            }
          : passenger,
      ),
    );
  }

  return (
    <div className="space-y-4 tm-flight-passenger-editor">
      <div className="text-sm font-semibold text-gray-700">
        👥 旅客資訊
      </div>

      {list.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-100">
          {list.map((passenger) => {
            const passengerCurrency = passenger.currency || "JPY";
            const passengerPrice = passenger.price ?? "";

            return (
              <div
                key={passenger.id}
                className="tm-flight-passenger-edit-item border-b border-gray-100 p-3 last:border-b-0"
              >
                <div className="tm-flight-passenger-edit-name text-sm font-semibold text-slate-800">
                  👤 {passenger.name}
                </div>

                <div className="tm-flight-passenger-edit-fields mt-2">
                  <input
                    type="text"
                    placeholder="座位"
                    aria-label="座位"
                    className="rounded-lg border px-2 py-2 text-xs"
                    value={passenger.seat || ""}
                    onChange={(e) =>
                      updatePassenger(passenger.id, "seat", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    min="0"
                    placeholder="kg"
                    aria-label="行李公斤"
                    className="rounded-lg border px-2 py-2 text-xs"
                    value={passenger.baggageKg ?? ""}
                    onChange={(e) =>
                      updatePassenger(
                        passenger.id,
                        "baggageKg",
                        e.target.value,
                      )
                    }
                  />

                  <select
                    className="rounded-lg border px-1 py-2 text-xs"
                    value={passengerCurrency}
                    onChange={(e) =>
                      updatePassenger(
                        passenger.id,
                        "currency",
                        e.target.value,
                      )
                    }
                  >
                    {CURRENCIES.map(([code, sign]) => (
                      <option key={code} value={code}>
                        {sign}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0"
                    placeholder="價格"
                    className="rounded-lg border px-2 py-2 text-right text-xs"
                    value={passengerPrice}
                    onChange={(e) =>
                      updatePassenger(
                        passenger.id,
                        "price",
                        e.target.value,
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() => removePassenger(passenger.id)}
                    className="rounded-lg px-2 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div>
        <select
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)}
          className="w-full rounded-xl border px-4 py-3 text-sm"
        >
          <option value="">選擇旅客</option>
          {personList.map((person) => (
            <option key={person} value={person}>
              {person}
            </option>
          ))}
        </select>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="座位（例如 12A）"
            className="min-w-0 rounded-xl border px-3 py-2.5 text-sm"
            value={seat}
            onChange={(e) => setSeat(e.target.value)}
          />

          <input
            type="number"
            min="0"
            placeholder="行李（kg）"
            className="min-w-0 rounded-xl border px-3 py-2.5 text-sm"
            value={baggageKg}
            onChange={(e) => setBaggageKg(e.target.value)}
          />
        </div>

        <div className="mt-2 flex gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-24 rounded-xl border px-2 py-2.5 text-sm"
          >
            {CURRENCIES.map(([code, sign]) => (
              <option key={code} value={code}>
                {sign} {code}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            placeholder="價格（可不填）"
            className="min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={addPassenger}
          className="mt-2 w-full rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
        >
          ＋ 加入旅客
        </button>

        <button
          type="button"
          onClick={() => setShowNewPerson((value) => !value)}
          className="mt-2 w-full rounded-xl border border-dashed border-gray-300 py-2.5 text-sm text-gray-600"
        >
          ＋ 新增共用旅客姓名
        </button>

        {showNewPerson && (
          <div className="mt-2 flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm"
              placeholder="輸入姓名"
              value={personInput}
              onChange={(e) => setPersonInput(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddPerson}
              className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm text-white"
            >
              加入
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
