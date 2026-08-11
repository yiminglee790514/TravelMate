import { useEffect, useMemo, useState } from "react";
import { calculateTravelTime } from "../../services/mapsService";

const MODES = [
  { value: "DRIVE", icon: "🚗", label: "開車" },
  { value: "TRANSIT", icon: "🚆", label: "大眾運輸" },
  { value: "WALK", icon: "🚶", label: "步行" },
  { value: "BICYCLE", icon: "🚲", label: "單車" },
  { value: "TWO_WHEELER", icon: "🏍️", label: "機車" },
];

function toDepartureTime(date, time) {
  if (!date || !time) return "";
  const local = new Date(`${date}T${time}:00`);
  if (Number.isNaN(local.getTime())) return "";
  return local.toISOString();
}

export default function TravelTimeConnector({
  from,
  to,
  trip,
  date,
  initialMode = "DRIVE",
  initialResult = null,
  onResult,
}) {
  const [mode, setMode] = useState(initialMode);
  const [result, setResult] = useState(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const regionCode = useMemo(() => {
    const map = {
      日本: "JP",
      韓國: "KR",
      南韓: "KR",
      台灣: "TW",
      臺灣: "TW",
      美國: "US",
      法國: "FR",
      義大利: "IT",
      泰國: "TH",
      新加坡: "SG",
    };
    return map[trip?.country] || "";
  }, [trip?.country]);

  useEffect(() => {
    setMode(initialMode || "DRIVE");
    setResult(initialResult || null);
  }, [from?.id, to?.id, initialMode, initialResult]);

  useEffect(() => {
    if (!from?.address || !to?.address || initialResult) return;
    handleCalculate(initialMode || "DRIVE");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from?.id, to?.id, from?.address, to?.address, date]);

  async function handleCalculate(nextMode = mode) {
    if (!from?.address || !to?.address) {
      setError("兩個行程都要有地址才能計算交通時間。");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await calculateTravelTime({
        origin: from.address,
        destination: to.address,
        mode: nextMode,
        departureTime: toDepartureTime(date, from.time),
        regionCode,
      });

      setResult(data);
      onResult?.({ mode: nextMode, ...data });
    } catch (err) {
      console.error(err);
      setResult(null);
      setError(err?.message || "交通時間計算失敗");
    } finally {
      setLoading(false);
    }
  }

  function handleModeChange(event) {
    const nextMode = event.target.value;
    setMode(nextMode);
    handleCalculate(nextMode);
  }

  const selected = MODES.find((item) => item.value === mode) || MODES[0];

  return (
    <div className="tm-travel-connector">
      <div className="tm-travel-connector-line" aria-hidden="true" />
      <div className="tm-travel-connector-content">
        <span className="tm-travel-connector-icon">{selected.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tm-travel-connector-title">交通時間</span>
            <select
              value={mode}
              onChange={handleModeChange}
              className="tm-travel-mode-select"
              aria-label="交通工具"
            >
              {MODES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.icon} {item.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="tm-travel-connector-result">計算中…</div>
          ) : result ? (
            <div className="tm-travel-connector-result">
              {result.durationText || "約 -- 分鐘"}
              {result.distanceText ? ` · ${result.distanceText}` : ""}
            </div>
          ) : (
            <button type="button" onClick={() => handleCalculate()} className="tm-travel-calculate-button">
              自動計算
            </button>
          )}

          {error && <div className="tm-travel-connector-error">⚠️ {error}</div>}
        </div>
      </div>
    </div>
  );
}
