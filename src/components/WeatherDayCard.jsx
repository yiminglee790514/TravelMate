import { useEffect, useState } from "react";

const WEATHER_META = {
  0: ["晴天", "☀️"],
  1: ["大致晴朗", "🌤️"],
  2: ["多雲", "⛅"],
  3: ["陰天", "☁️"],
  45: ["霧", "🌫️"],
  48: ["霧", "🌫️"],
  51: ["毛毛雨", "🌦️"],
  53: ["毛毛雨", "🌦️"],
  55: ["毛毛雨", "🌧️"],
  56: ["凍毛毛雨", "🌧️"],
  57: ["凍毛毛雨", "🌧️"],
  61: ["小雨", "🌦️"],
  63: ["中雨", "🌧️"],
  65: ["大雨", "🌧️"],
  66: ["凍雨", "🌧️"],
  67: ["凍雨", "🌧️"],
  71: ["小雪", "🌨️"],
  73: ["中雪", "🌨️"],
  75: ["大雪", "❄️"],
  77: ["雪粒", "❄️"],
  80: ["陣雨", "🌦️"],
  81: ["陣雨", "🌧️"],
  82: ["大陣雨", "⛈️"],
  85: ["陣雪", "🌨️"],
  86: ["大陣雪", "❄️"],
  95: ["雷雨", "⛈️"],
  96: ["雷雨伴冰雹", "⛈️"],
  99: ["雷雨伴冰雹", "⛈️"],
};

function weatherMeta(code) {
  return WEATHER_META[Number(code)] || ["天氣", "🌤️"];
}

function formatNumber(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : "--";
}

function formatMm(value) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)} mm` : "--";
}

function formatWind(value) {
  return Number.isFinite(Number(value)) ? `${Math.round(Number(value))} km/h` : "--";
}

export { weatherMeta };

export default function WeatherDayCard({
  day,
  weather,
  onEdit,
  onEditOpen,
  readonly = false,
}) {
  const [editing, setEditing] = useState(false);
  const [city, setCity] = useState(day.city);

  useEffect(() => {
    setCity(day.city);
  }, [day.city]);

  const [condition, icon] = weatherMeta(weather?.weatherCode);
  const historical = weather?.mode === "historical-reference";
  const actualHistorical = weather?.mode === "historical";

  return (
    <section className="tm-weather-detail-card">
      <div className="tm-weather-main">
        <div className="tm-weather-icon">{icon}</div>
        <div className="tm-weather-temp">
          <span>{formatNumber(weather?.minTemp)}°</span>
          <b>/</b>
          <strong>{formatNumber(weather?.maxTemp)}°</strong>
        </div>
        <div className="tm-weather-condition">{condition}</div>
        {historical && (
          <div className="tm-weather-reference-badge">歷年同期參考</div>
        )}
        {actualHistorical && (
          <div className="tm-weather-reference-badge">歷史天氣</div>
        )}
      </div>

      <div className="tm-weather-stats">
        <div className="tm-weather-stat">
          <div className="tm-weather-stat-icon">🌡️</div>
          <div>
            <small>體感溫度</small>
            <strong>{formatNumber(weather?.apparentMax)}°</strong>
            <span>{historical ? "歷年平均" : "最高體感"}</span>
          </div>
        </div>

        <div className="tm-weather-stat">
          <div className="tm-weather-stat-icon">💧</div>
          <div>
            <small>{historical ? "平均降雨量" : "降雨機率"}</small>
            <strong>
              {historical
                ? formatMm(weather?.precipitation)
                : `${formatNumber(weather?.precipitationProbability)}%`}
            </strong>
            <span>{historical ? "同期平均" : "預報"}</span>
          </div>
        </div>

        <div className="tm-weather-stat">
          <div className="tm-weather-stat-icon">☔</div>
          <div>
            <small>降雨量</small>
            <strong>{formatMm(weather?.precipitation)}</strong>
            <span>{historical ? "同期平均" : "預報"}</span>
          </div>
        </div>

        <div className="tm-weather-stat">
          <div className="tm-weather-stat-icon">💨</div>
          <div>
            <small>風速</small>
            <strong>{formatWind(weather?.windSpeed)}</strong>
            <span>{historical ? "同期平均" : "最高風速"}</span>
          </div>
        </div>
      </div>

      {editing && !readonly && !onEditOpen && (
        <div className="tm-weather-edit-row">
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="輸入這一天的地區，例如 京都、姬路、熊本"
          />
          <button
            type="button"
            className="tm-weather-save"
            onClick={() => {
              onEdit(day, city.trim());
              setEditing(false);
            }}
          >
            儲存
          </button>
          <button
            type="button"
            className="tm-weather-cancel"
            onClick={() => {
              setCity(day.city);
              setEditing(false);
            }}
          >
            取消
          </button>
        </div>
      )}
    </section>
  );
}
