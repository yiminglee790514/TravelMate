import { useState } from "react";
import { AIRLINES } from "../../constants/airlines";
import { AIRPORTS } from "../../constants/airports";

export default function FlightModal({
  title,
  flight,
  onClose,
  onSave,
}) {

  const [airline, setAirline] = useState(flight?.airline || "");
  const [flightNo, setFlightNo] = useState(flight?.flightNo || "");

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

  const [terminal, setTerminal] = useState(
    flight?.terminal || ""
  );

  const [gate, setGate] = useState(
    flight?.gate || ""
  );

  const [seat, setSeat] = useState(
    flight?.seat || ""
  );

  function handleSave() {

    if (!airline || !flightNo) {
      alert("請輸入航空公司與航班號");
      return;
    }

    onSave({

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

      terminal,

      gate,

      seat,

    });

    onClose();
  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">    

        <h2 className="mb-6 text-2xl font-bold">

          {title}

        </h2>

        <div className="space-y-4">

          <select
            className="w-full rounded-xl border p-3"
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
            >
            <option value="">請選擇航空公司</option>

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
            className="w-full rounded-xl border p-3"
            placeholder="航班號 (CI919)"
            value={flightNo}
            onChange={(e)=>setFlightNo(e.target.value)}
          />

          <hr/>

          <div className="font-semibold">
            🛫 出發
          </div>

            <select
            className="w-full rounded-xl border p-3"
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
                className="w-full rounded-xl border p-3"
                placeholder="請輸入出發機場"
                value={departureName}
                onChange={(e) => setDepartureName(e.target.value)}
            />
            )}

            <input
            type="time"
            className="w-full rounded-xl border p-3"
            value={departureTime}
            onChange={(e)=>setDepartureTime(e.target.value)}
            />

          <hr/>

          <div className="font-semibold">
            🛬 抵達
          </div>

            <select
            className="w-full rounded-xl border p-3"
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
                className="w-full rounded-xl border p-3"
                placeholder="請輸入抵達機場"
                value={arrivalName}
                onChange={(e) => setArrivalName(e.target.value)}
            />
            )}

            <input
            type="time"
            className="w-full rounded-xl border p-3"
            value={arrivalTime}
            onChange={(e)=>setArrivalTime(e.target.value)}
            />

          <hr/>

          <input
            className="w-full rounded-xl border p-3"
            placeholder="Terminal"
            value={terminal}
            onChange={(e)=>setTerminal(e.target.value)}
          />

          <input
            className="w-full rounded-xl border p-3"
            placeholder="Gate"
            value={gate}
            onChange={(e)=>setGate(e.target.value)}
          />

          <input
            className="w-full rounded-xl border p-3"
            placeholder="Seat"
            value={seat}
            onChange={(e)=>setSeat(e.target.value)}
          />

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl bg-gray-200 px-5 py-3"
          >
            取消
          </button>

          <button
            onClick={handleSave}
            className="rounded-xl bg-blue-500 px-5 py-3 text-white"
          >
            儲存
          </button>

        </div>

      </div>

    </div>

  );

}