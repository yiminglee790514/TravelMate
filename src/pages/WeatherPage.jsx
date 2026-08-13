import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";
import { getWeatherForTrip } from "../services/weatherService";
import { canEdit } from "../services/permissionService";
import WeatherDayCard from "../components/WeatherDayCard";
import WeatherEditModal from "../components/WeatherEditModal";

function parseDate(value) {
  return new Date(`${value}T00:00:00`);
}

function addLocalDay(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function toLocalIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDayButton(dateString, dayNumber, weather) {
  const date = parseDate(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];

  const weatherIcons = {
    0: "☀️",
    1: "🌤️",
    2: "⛅",
    3: "☁️",
    45: "🌫️",
    48: "🌫️",
    51: "🌦️",
    53: "🌦️",
    55: "🌧️",
    56: "🌧️",
    57: "🌧️",
    61: "🌦️",
    63: "🌧️",
    65: "🌧️",
    66: "🌧️",
    67: "🌧️",
    71: "🌨️",
    73: "🌨️",
    75: "❄️",
    77: "❄️",
    80: "🌦️",
    81: "🌧️",
    82: "⛈️",
    85: "🌨️",
    86: "❄️",
    95: "⛈️",
    96: "⛈️",
    99: "⛈️",
  };

  return {
    day: `Day ${dayNumber}`,
    date: `${month}/${day}`,
    weekday: `(${weekday})`,
    icon: weather
      ? (weatherIcons[Number(weather?.weatherCode)] || "🌤️")
      : "⏳",
  };
}

export default function WeatherPage() {
  const { id, shareId } = useParams();
  const { trip: cloudTrip, updateTrip } = useTrip(id);
  const [trip, setTrip] = useState(null);
  const [weatherMap, setWeatherMap] = useState(new Map());
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingDay, setEditingDay] = useState(null);
  const tabRefs = useRef(new Map());

  const readonly = !!shareId || (trip ? !canEdit(trip) : true);

  useEffect(() => {
    let cancelled = false;

    async function loadTrip() {
      let data = shareId ? await getShare(shareId) : cloudTrip;
      if (!data) return;

      const start = new Date(`${data.startDate}T00:00:00`);
      const end = new Date(`${data.endDate}T00:00:00`);
      const days = [];
      let current = new Date(start);

      // 不使用 toISOString() 取日期，避免台灣時區在 00:00 被轉成 UTC
      // 後日期往前一天，造成 10/21 行程變成 10/20。
      while (current <= end) {
        const date = toLocalIsoDate(current);
        const old = (data.weather || []).find((item) => item.date === date);
        days.push(
          old || {
            id: `${date}-${Math.random().toString(36).slice(2)}`,
            date,
            city: data.city,
          }
        );
        current = addLocalDay(current, 1);
      }

      const changed =
        days.length !== (data.weather || []).length ||
        days.some((day, index) => day.date !== data.weather?.[index]?.date);

      if (changed && !shareId) {
        data = { ...data, weather: days };
        await updateTrip(data);
      } else {
        data = { ...data, weather: days };
      }

      if (cancelled) return;
      setTrip(data);
      setSelectedDate((value) => value || days[0]?.date || null);
      setLoading(true);
      setError("");

      try {
        const nextWeather = await getWeatherForTrip(days);
        if (!cancelled) setWeatherMap(nextWeather);
      } catch (loadError) {
        console.error(loadError);
        if (!cancelled) setError(loadError?.message || "天氣資料讀取失敗，請稍後再試。");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTrip();
    return () => {
      cancelled = true;
    };
  }, [cloudTrip, shareId]);

  const days = trip?.weather || [];
  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate) || days[0],
    [days, selectedDate]
  );

  const selectedWeather = selectedDay
    ? weatherMap.get(`${selectedDay.city}::${selectedDay.date}`)
    : null;

  async function handleEdit(day, newCity) {
    if (readonly || !newCity) return;

    // 每一天可以有自己的地區，不再把整趟旅程全部改成同一個城市。
    const updatedWeather = days.map((item) =>
      item.date === day.date ? { ...item, city: newCity } : item
    );
    const updatedTrip = {
      ...trip,
      weather: updatedWeather,
    };

    setTrip(updatedTrip);
    setWeatherMap((previous) => {
      const next = new Map(previous);
      next.delete(`${day.city}::${day.date}`);
      next.delete(`${newCity}::${day.date}`);
      return next;
    });
    setLoading(true);
    setError("");

    if (!shareId) await updateTrip(updatedTrip);

    try {
      // 只重新抓這一天，避免改一個地區卻讓整趟行程全部重抓。
      const nextWeather = await getWeatherForTrip([
        updatedWeather.find((item) => item.date === day.date),
      ]);
      setWeatherMap((previous) => {
        const next = new Map(previous);
        nextWeather.forEach((value, key) => next.set(key, value));
        return next;
      });
    } catch (loadError) {
      console.error(loadError);
      setError(`${newCity} 天氣資料讀取失敗，請稍後再試。`);
    } finally {
      setLoading(false);
    }
  }

  function selectDay(date) {
    setSelectedDate(date);
    requestAnimationFrame(() => {
      tabRefs.current.get(date)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    });
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb] text-gray-500">
        載入中...
      </div>
    );
  }

  return (
    <div className="tm-weather-page">
      <div className="tm-weather-shell">
        <header className="tm-weather-heading">
          <div>
            <h1>🌤️ 行程天氣</h1>
          </div>
          {!readonly && (
            <button
              type="button"
              className="tm-weather-api-badge tm-weather-edit-all-button"
              onClick={() => setEditingDay({ bulk: true })}
            >
              ✏️ 編輯
            </button>
          )}
        </header>

        <div className="tm-weather-tabs-wrap">
          <div className="tm-weather-tabs scrollbar-none">
            {days.map((day, index) => {
              const dayWeather = weatherMap.get(`${day.city}::${day.date}`);
              const button = formatDayButton(day.date, index + 1, dayWeather);
              const active = day.date === selectedDay?.date;
              return (
                <button
                  key={day.date}
                  ref={(node) => {
                    if (node) tabRefs.current.set(day.date, node);
                  }}
                  type="button"
                  onClick={() => selectDay(day.date)}
                  className={`tm-weather-tab ${active ? "is-active" : ""}`}
                >
                  <span className="tm-weather-tab-day">{button.day}</span>
                  <strong className="tm-weather-tab-date">
                    {button.date} <small>{button.weekday}</small>
                  </strong>
                  <span className="tm-weather-tab-location">
                    <span>📍 {day.city || trip.city || "未設定"}</span>
                    <span className="tm-weather-tab-icon" aria-hidden="true">{button.icon}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="tm-weather-error">{error}</div>
        )}

        {selectedDay && (
          <>
            <div className="tm-weather-selected-title">
              <div>
                <strong>{formatDayButton(
                  selectedDay.date,
                  days.findIndex((item) => item.date === selectedDay.date) + 1,
                  selectedWeather
                ).date}</strong>
                <span>{formatDayButton(
                  selectedDay.date,
                  days.findIndex((item) => item.date === selectedDay.date) + 1,
                  selectedWeather
                ).weekday}</span>
              </div>

              <div className="tm-weather-selected-location">
                <span>📍 {selectedDay.city}</span>
                <span className="tm-weather-selected-weather-icon" aria-hidden="true">
                  {formatDayButton(
                    selectedDay.date,
                    days.findIndex((item) => item.date === selectedDay.date) + 1,
                    selectedWeather
                  ).icon}
                </span>
                {selectedWeather?.mode === "historical-reference" && (
                  <span className="tm-weather-top-source">歷年參考</span>
                )}
                {selectedWeather?.mode === "forecast" && (
                  <span className="tm-weather-top-source is-live">即時預報</span>
                )}
                {!selectedWeather && !loading && (
                  <span className="tm-weather-top-source is-error">未取得</span>
                )}

              </div>
            </div>

            {loading ? (
              <div className="tm-weather-loading">
                <div className="tm-weather-loading-icon">🌤️</div>
                <strong>正在取得 {selectedDay.city} 天氣...</strong>
                <span>
                  出發日在未來 16 天內時使用即時預報；超過 16 天會自動切換為「歷年同期參考」。
                </span>
              </div>
            ) : selectedWeather ? (
              <WeatherDayCard
                key={`${selectedDay.city}-${selectedDay.date}`}
                day={selectedDay}
                weather={selectedWeather}
                readonly={readonly}
                onEdit={handleEdit}
                onEditOpen={() => setEditingDay(selectedDay)}
              />
            ) : (
              <div className="tm-weather-loading tm-weather-no-data">
                <div className="tm-weather-loading-icon">🌤️</div>
                <strong>目前沒有這一天的天氣資料</strong>
                <span>
                  {error || "請稍後再試；如果是超過 16 天的日期，系統會使用 Open-Meteo 歷年同期參考。"}
                </span>
              </div>
            )}
          </>
        )}

        {editingDay && !readonly && (
          <WeatherEditModal
            days={days}
            onClose={() => setEditingDay(null)}
            onSave={async (updatedWeather) => {
              const updatedTrip = {
                ...trip,
                weather: updatedWeather,
              };

              setTrip(updatedTrip);
              setEditingDay(null);
              setWeatherMap(new Map());
              setLoading(true);
              setError("");

              try {
                await updateTrip(updatedTrip);
                const nextWeather = await getWeatherForTrip(updatedWeather);
                setWeatherMap(nextWeather);
              } catch (loadError) {
                console.error(loadError);
                setError(
                  loadError?.message || "天氣資料讀取失敗，請稍後再試。"
                );
              } finally {
                setLoading(false);
              }
            }}
          />
        )}

      </div>
    </div>
  );
}
