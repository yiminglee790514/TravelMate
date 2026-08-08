import { useState } from "react";

export default function FlightPassengerEditor({
  passengers = [],
  people = [],
  onChange,
  onAddPerson,
}) {
  const list = Array.isArray(passengers)
    ? passengers
    : [];

  const personList = Array.isArray(people)
    ? people
    : [];

  const [selectedName, setSelectedName] =
    useState("");

  const [baggage, setBaggage] =
    useState("23");

  const [showNewPerson, setShowNewPerson] =
    useState(false);

  const [personInput, setPersonInput] =
    useState("");

  // =========================
  // 新增旅客
  // =========================
  async function addPassenger() {
    const name = selectedName.trim();

    if (!name) {
      alert("請選擇旅客");
      return;
    }

    // 避免同一趟航班重複加入
    if (
      list.some(
        (passenger) =>
          passenger.name === name
      )
    ) {
      alert("這位旅客已經加入");
      return;
    }

    const newPassenger = {
      id: Date.now(),
      name,
      baggage:
        baggage === ""
          ? 0
          : Number(baggage),
    };

    onChange([
      ...list,
      newPassenger,
    ]);

    setSelectedName("");
    setBaggage("23");
  }

  // =========================
  // 新增共用人名
  // =========================
  async function handleAddPerson() {
    const name = personInput.trim();

    if (!name) return;

    if (
      personList.includes(name)
    ) {
      alert("這個名字已經存在");
      return;
    }

    // 寫入共用人名
    await onAddPerson?.(name);

    // 新增後直接選成旅客
    setSelectedName(name);

    setPersonInput("");
    setShowNewPerson(false);
  }

  // =========================
  // 刪除旅客
  // =========================
  function removePassenger(id) {
    onChange(
      list.filter(
        (passenger) =>
          passenger.id !== id
      )
    );
  }

  // =========================
  // 修改行李
  // =========================
  function updateBaggage(
    id,
    value
  ) {
    onChange(
      list.map((passenger) =>
        passenger.id === id
          ? {
              ...passenger,
              baggage:
                value === ""
                  ? ""
                  : Number(value),
            }
          : passenger
      )
    );
  }

  return (
    <div className="space-y-4">

      {/* =========================
          標題
      ========================= */}
      <div className="text-sm font-semibold text-gray-700">
        👥 旅客資訊
      </div>


      {/* =========================
          已加入旅客
      ========================= */}
      {list.length > 0 && (
        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-gray-100
          "
        >
          {list.map((passenger) => (
            <div
              key={passenger.id}
              className="
                flex
                items-center
                gap-2
                border-b
                border-gray-100
                p-3
                last:border-b-0
              "
            >

              <div
                className="
                  min-w-0
                  flex-1
                  truncate
                  text-sm
                  font-semibold
                "
              >
                👤 {passenger.name}
              </div>

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-1
                "
              >

                <span className="text-xs text-gray-500">
                  🧳
                </span>

                <input
                  type="number"
                  min="0"
                  className="
                    w-20
                    rounded-lg
                    border
                    px-2
                    py-1.5
                    text-center
                    text-sm
                  "
                  value={
                    passenger.baggage
                  }
                  onChange={(e) =>
                    updateBaggage(
                      passenger.id,
                      e.target.value
                    )
                  }
                />

                <span className="text-xs text-gray-500">
                  公斤
                </span>

                <button
                  type="button"
                  onClick={() =>
                    removePassenger(
                      passenger.id
                    )
                  }
                  className="
                    ml-1
                    rounded-lg
                    px-2
                    py-1
                    text-sm
                    text-red-500
                    hover:bg-red-50
                  "
                >
                  ×
                </button>

              </div>
            </div>
          ))}
        </div>
      )}


      {/* =========================
          選擇旅客
      ========================= */}
      <div>
        <select
          value={selectedName}
          onChange={(e) =>
            setSelectedName(
              e.target.value
            )
          }
          className="
            w-full
            rounded-xl
            border
            px-4
            py-3
          "
        >

          <option value="">
            選擇旅客
          </option>

          {personList.map((person) => (
            <option
              key={person}
              value={person}
            >
              {person}
            </option>
          ))}

        </select>


        {/* 新增旅客 */}
        <button
          type="button"
          onClick={addPassenger}
          className="
            mt-2
            w-full
            rounded-xl
            bg-blue-500
            py-2.5
            text-sm
            font-semibold
            text-white
            hover:bg-blue-600
          "
        >
          ＋ 加入旅客
        </button>


        {/* =========================
            新增共用人名
        ========================= */}
        <button
          type="button"
          onClick={() =>
            setShowNewPerson(
              (value) => !value
            )
          }
          className="
            mt-2
            text-sm
            text-blue-600
          "
        >
          ＋ 新增旅客姓名
        </button>


        {showNewPerson && (
          <div className="mt-2 flex gap-2">

            <input
              value={personInput}
              onChange={(e) =>
                setPersonInput(
                  e.target.value
                )
              }
              placeholder="輸入姓名"
              className="
                min-w-0
                flex-1
                rounded-xl
                border
                px-4
                py-2
              "
            />

            <button
              type="button"
              onClick={
                handleAddPerson
              }
              className="
                rounded-xl
                bg-blue-500
                px-4
                text-white
              "
            >
              加入
            </button>

          </div>
        )}

      </div>

    </div>
  );
}