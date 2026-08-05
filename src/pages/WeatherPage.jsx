import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import tripService from "../services/tripService";
import { getWeather } from "../services/weatherService";

export default function WeatherPage() {

  const { id } = useParams();

  const trip = tripService.getTrip(id);
  function generateWeatherDays() {

  if (trip.weather.length > 0) return;

  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  const weather = [];

  const current = new Date(start);

  while (current <= end) {

    weather.push({

      id: Date.now() + weather.length,

      date: current.toISOString().split("T")[0],

      city: trip.city,

    });

    current.setDate(current.getDate() + 1);

  }

  trip.weather = weather;

  tripService.updateTrip(trip);

}

  const [city, setCity] = useState(trip?.city || "");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadWeather(searchCity = city) {

    try {

      setLoading(true);

      const data = await getWeather(searchCity);

      console.log(data);

      setWeather(data);

    } catch (err) {

      console.error(err);

      alert("查詢天氣失敗");

    } finally {

      setLoading(false);

    }

  }

useEffect(() => {

  if (!trip) return;

  generateWeatherDays();

  loadWeather(trip.city);

// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  if (!trip) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        找不到旅程
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-md px-6 py-10">

        <Link
          to={`/trip/${id}`}
          className="text-blue-500"
        >
          ← 返回旅程
        </Link>

        <h1 className="mt-6 text-4xl font-bold">
          🌤️ 天氣
        </h1>

        <div className="mt-6">

          <label className="mb-2 block text-sm font-medium text-gray-600">
            天氣地點
          </label>

          <div className="flex gap-2">

            <input
              className="flex-1 rounded-xl border p-3"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <button
              onClick={() => loadWeather(city)}
              className="rounded-xl bg-blue-500 px-5 text-white"
            >
              查詢
            </button>

          </div>

        </div>

        <div className="mt-8 space-y-4">

          {loading ? (

            <div className="rounded-2xl bg-white p-8 text-center shadow">
              讀取天氣中...
            </div>

          ) : weather?.forecast?.forecastday ? (

            weather.forecast.forecastday.map((day) => (

              <div
                key={day.date}
                className="rounded-2xl bg-white p-5 shadow"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <div className="text-lg font-bold">

                      {day.date}

                    </div>

                    <div className="mt-1 text-gray-500">

                      {day.day.condition.text}

                    </div>

                  </div>

                  <img
                    src={day.day.condition.icon}
                    alt={day.day.condition.text}
                    className="h-14 w-14"
                  />

                </div>

                <div className="mt-4 text-lg">

                  🌡️ {day.day.mintemp_c}° ~ {day.day.maxtemp_c}°

                </div>

                <div className="mt-2 text-gray-500">

                  ☔ 降雨機率 {day.day.daily_chance_of_rain}%

                </div>

              </div>

            ))

          ) : (

            <div className="rounded-2xl bg-white p-8 text-center shadow">

              查無天氣資料

            </div>

          )}

        </div>

      </div>

    </div>

  );

}