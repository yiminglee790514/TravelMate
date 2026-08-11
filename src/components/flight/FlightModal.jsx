import { useState } from "react";
import { AIRLINES } from "../../constants/airlines";
import { AIRPORTS } from "../../constants/airports";
import FlightPassengerEditor from "./FlightPassengerEditor";

export default function FlightModal({
  title,
  flight,
  people = [],
  onClose,
  onSave,
  onAddPerson,
}) {

  // =========================
  // 航班日期
  // =========================

  const [date, setDate] = useState(
    flight?.date || ""
  );

  const [airline, setAirline] = useState(
    flight?.airline || ""
  );

  const [flightNo, setFlightNo] = useState(
    flight?.flightNo || ""
  );

  const [departureCode, setDepartureCode] = useState(
    flight?.departure?.code || ""
  );

  const [departureName, setDepartureName] = useState(
    flight?.departure?.name || ""
  );

  const [departureTime, setDepartureTime] = useState(
    flight?.departure?.time || ""
  );

  const [arrivalCode, setArrivalCode] = useState(
    flight?.arrival?.code || ""
  );

  const [arrivalName, setArrivalName] = useState(
    flight?.arrival?.name || ""
  );

  const [arrivalTime, setArrivalTime] = useState(
    flight?.arrival?.time || ""
  );

  // =========================
  // 旅客資訊
  // =========================

  const [passengers, setPassengers] = useState(
    Array.isArray(flight?.passengers)
      ? flight.passengers
      : []
  );

  // =========================
  // 儲存
  // =========================

  function handleSave() {

    if (!date) {
      alert("請選擇航班日期");
      return;
    }

    if (!airline || !flightNo) {
      alert("請輸入航空公司與航班號");
      return;
    }

    onSave({

      id: flight?.id || Date.now(),

      // ⭐ 航班自己的日期
      date,

      airline,

      flightNo,

      departure: {
        code: departureCode,
        name: departureName,
        time: departureTime,
      },

      arrival: {
        code: arrivalCode,
        name: arrivalName,
        time: arrivalTime,
      },

      passengers,

    });

    onClose();
  }

  return (

    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-3 sm:p-4">

      <div className="tm-flight-modal max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6">

        <h2 className="mb-5 text-xl font-bold">
          {title}
        </h2>

        <div className="space-y-4">

          {/* =========================
              航班日期
          ========================= */}

          <div>

            <div className="mb-2 font-semibold">
              📅 航班日期
            </div>

            <input
              type="date"
              className="w-full rounded-xl border p-2.5 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

          </div>

          {/* =========================
              航空公司
          ========================= */}

          <select
            className="w-full rounded-xl border p-2.5 text-sm"
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
          >

            <option value="">
              請選擇航空公司
            </option>

            {AIRLINES.map((item) => (

              <option
                key={item.code}
                value={item.name}
              >
                {item.code}｜{item.name}
              </option>

            ))}

          </select>

          <input
            className="w-full rounded-xl border p-2.5 text-sm"
            placeholder="航班號 (CI919)"
            value={flightNo}
            onChange={(e) => setFlightNo(e.target.value)}
          />

          <hr />

          {/* =========================
              出發
          ========================= */}

          <div className="font-semibold">
            🛫 出發
          </div>

          <select
            className="w-full rounded-xl border p-2.5 text-sm"
            value={departureCode}
            onChange={(e) => {

              const airport = AIRPORTS.find(
                (a) => a.code === e.target.value
              );

              if (!airport) return;

              setDepartureCode(airport.code);

              if (airport.code !== "CUSTOM") {
                setDepartureName(airport.name);
              } else {
                setDepartureName("");
              }

            }}
          >

            <option value="">
              請選擇出發機場
            </option>

            {AIRPORTS.map((airport) => (

              <option
                key={airport.code}
                value={airport.code}
              >
                {airport.code}｜{airport.name}
              </option>

            ))}

          </select>

          {departureCode === "CUSTOM" && (

            <input
              className="w-full rounded-xl border p-2.5 text-sm"
              placeholder="請輸入出發機場"
              value={departureName}
              onChange={(e) =>
                setDepartureName(e.target.value)
              }
            />

          )}

          <input
            type="time"
            className="w-full rounded-xl border p-2.5 text-sm"
            value={departureTime}
            onChange={(e) =>
              setDepartureTime(e.target.value)
            }
          />

          <hr />

          {/* =========================
              抵達
          ========================= */}

          <div className="font-semibold">
            🛬 抵達
          </div>

          <select
            className="w-full rounded-xl border p-2.5 text-sm"
            value={arrivalCode}
            onChange={(e) => {

              const airport = AIRPORTS.find(
                (a) => a.code === e.target.value
              );

              if (!airport) return;

              setArrivalCode(airport.code);

              if (airport.code !== "CUSTOM") {
                setArrivalName(airport.name);
              } else {
                setArrivalName("");
              }

            }}
          >

            <option value="">
              請選擇抵達機場
            </option>

            {AIRPORTS.map((airport) => (

              <option
                key={airport.code}
                value={airport.code}
              >
                {airport.code}｜{airport.name}
              </option>

            ))}

          </select>

          {arrivalCode === "CUSTOM" && (

            <input
              className="w-full rounded-xl border p-2.5 text-sm"
              placeholder="請輸入抵達機場"
              value={arrivalName}
              onChange={(e) =>
                setArrivalName(e.target.value)
              }
            />

          )}

          <input
            type="time"
            className="w-full rounded-xl border p-2.5 text-sm"
            value={arrivalTime}
            onChange={(e) =>
              setArrivalTime(e.target.value)
            }
          />

          <hr />

          {/* =========================
              旅客資訊
          ========================= */}

          <FlightPassengerEditor
            passengers={passengers}
            people={people}
            onChange={setPassengers}
            onAddPerson={onAddPerson}
            />

        </div>

        {/* =========================
            按鈕
        ========================= */}

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl bg-gray-200 px-4 py-2.5 text-sm"
          >
            取消
          </button>

          <button
            onClick={handleSave}
            className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm text-white"
          >
            儲存
          </button>

        </div>

      </div>

    </div>

  );

}