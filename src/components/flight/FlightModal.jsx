import { useState } from "react";
import { AIRLINES } from "../../constants/airlines";
import { AIRPORTS } from "../../constants/airports";
import FlightPassengerEditor from "./FlightPassengerEditor";
import { searchPlaceAddress } from "../../services/mapsService";
import { getRegionCode } from "../../services/mapsCountry";

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

  const [departureAddress, setDepartureAddress] = useState(
    flight?.departure?.address || ""
  );

  const [departureDuration, setDepartureDuration] = useState(
    flight?.departure?.durationMinutes ?? ""
  );

  const [departureAddressLoading, setDepartureAddressLoading] = useState(false);

  const [arrivalCode, setArrivalCode] = useState(
    flight?.arrival?.code || ""
  );

  const [arrivalName, setArrivalName] = useState(
    flight?.arrival?.name || ""
  );

  const [arrivalTime, setArrivalTime] = useState(
    flight?.arrival?.time || ""
  );

  const [arrivalAddress, setArrivalAddress] = useState(
    flight?.arrival?.address || ""
  );

  const [arrivalDuration, setArrivalDuration] = useState(
    flight?.arrival?.durationMinutes ?? ""
  );

  const [arrivalAddressLoading, setArrivalAddressLoading] = useState(false);

  async function findAirportAddress(kind) {
    const isDeparture = kind === "departure";
    const code = isDeparture ? departureCode : arrivalCode;
    const name = isDeparture ? departureName : arrivalName;
    const setLoading = isDeparture ? setDepartureAddressLoading : setArrivalAddressLoading;
    const setAddress = isDeparture ? setDepartureAddress : setArrivalAddress;

    if (!name && !code) {
      alert("請先選擇機場");
      return;
    }

    const airport = AIRPORTS.find((item) => item.code === code);
    if (airport?.address) {
      setAddress(airport.address);
      return;
    }

    setLoading(true);
    try {
      const result = await searchPlaceAddress({
        query: `${name || code} airport`,
        regionCode: getRegionCode(airport?.countryCode || ""),
      });
      const place = Array.isArray(result?.places) ? result.places[0] : null;
      if (place?.address) setAddress(place.address);
      else alert("找不到機場地址，請手動輸入。");
    } catch (error) {
      console.error("搜尋機場地址失敗", error);
      alert(error?.message || "搜尋機場地址失敗");
    } finally {
      setLoading(false);
    }
  }

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
        address: departureAddress,
        durationMinutes: departureDuration === "" ? "" : Math.max(0, Number(departureDuration) || 0),
      },

      arrival: {
        code: arrivalCode,
        name: arrivalName,
        time: arrivalTime,
        address: arrivalAddress,
        durationMinutes: arrivalDuration === "" ? "" : Math.max(0, Number(arrivalDuration) || 0),
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
                setDepartureAddress(airport.address || "");
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

          <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50 p-3">
            <div className="text-sm font-semibold text-blue-700">📍 自動帶入行程表的地址</div>
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-xl border p-2.5 text-sm"
                placeholder="出發機場地址"
                value={departureAddress}
                onChange={(e) => setDepartureAddress(e.target.value)}
              />
              <button
                type="button"
                onClick={() => findAirportAddress("departure")}
                disabled={departureAddressLoading}
                className="shrink-0 rounded-xl bg-blue-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {departureAddressLoading ? "搜尋中" : "自動找"}
              </button>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">⏱️ 停留時間（分鐘）</label>
              <input
                type="number"
                min="0"
                step="5"
                inputMode="numeric"
                className="w-full rounded-xl border p-2.5 text-sm"
                placeholder="例如：60"
                value={departureDuration}
                onChange={(e) => setDepartureDuration(e.target.value)}
              />
            </div>
            <div className="text-xs text-slate-500">這兩項會跟著航班自動帶入行程表，不會自動修改下一個行程時間。</div>
          </div>

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
                setArrivalAddress(airport.address || "");
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

          <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50 p-3">
            <div className="text-sm font-semibold text-blue-700">📍 自動帶入行程表的地址</div>
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-xl border p-2.5 text-sm"
                placeholder="抵達機場地址"
                value={arrivalAddress}
                onChange={(e) => setArrivalAddress(e.target.value)}
              />
              <button
                type="button"
                onClick={() => findAirportAddress("arrival")}
                disabled={arrivalAddressLoading}
                className="shrink-0 rounded-xl bg-blue-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {arrivalAddressLoading ? "搜尋中" : "自動找"}
              </button>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">⏱️ 停留時間（分鐘）</label>
              <input
                type="number"
                min="0"
                step="5"
                inputMode="numeric"
                className="w-full rounded-xl border p-2.5 text-sm"
                placeholder="例如：60"
                value={arrivalDuration}
                onChange={(e) => setArrivalDuration(e.target.value)}
              />
            </div>
            <div className="text-xs text-slate-500">這兩項會跟著航班自動帶入行程表，不會自動修改下一個行程時間。</div>
          </div>

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