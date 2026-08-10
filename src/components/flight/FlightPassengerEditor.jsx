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

function symbol(currency) {
  return CURRENCIES.find(([code]) => code === currency)?.[1] || currency || "";
}

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
      },
    ]);

    setSelectedName("");
    setPrice("");
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
              [field]: field === "price" && value !== "" ? Number(value) : value,
            }
          : passenger
      )
    );
  }

  return (
    <div className="space-y-4">
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
                className="border-b border-gray-100 p-3 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1 break-words text-sm font-semibold">
                    👤 {passenger.name}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <select
                      className="w-16 rounded-lg border px-1 py-1.5 text-xs"
                      value={passengerCurrency}
                      onChange={(e) =>
                        updatePassenger(passenger.id, "currency", e.target.value)
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
                      className="w-24 rounded-lg border px-2 py-1.5 text-right text-sm"
                      value={passengerPrice}
                      onChange={(e) =>
                        updatePassenger(passenger.id, "price", e.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() => removePassenger(passenger.id)}
                      className="ml-1 rounded-lg px-2 py-1 text-sm text-red-500 hover:bg-red-50"
                    >
                      ×
                    </button>
                  </div>
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
          className="w-full rounded-xl border px-4 py-3"
        >
          <option value="">選擇旅客</option>
          {personList.map((person) => (
            <option key={person} value={person}>
              {person}
            </option>
          ))}
        </select>

        <div className="mt-2 flex gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-24 rounded-xl border px-2 py-3"
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
            className="min-w-0 flex-1 rounded-xl border px-3 py-3"
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
              className="min-w-0 flex-1 rounded-xl border px-3 py-2.5"
              placeholder="輸入姓名"
              value={personInput}
              onChange={(e) => setPersonInput(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddPerson}
              className="rounded-xl bg-gray-800 px-4 py-2.5 text-white"
            >
              加入
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
