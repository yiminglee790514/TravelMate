import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import tripService from "../services/tripService";
import { getWeather } from "../services/weatherService";
import WeatherDayCard from "../components/WeatherDayCard";

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

function handleEdit(day, newCity) {

  day.city = newCity;

  tripService.updateTrip(trip);

  loadWeather(newCity);

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



        <div className="mt-8 space-y-4">

          {loading ? (

            <div className="rounded-2xl bg-white p-8 text-center shadow">
              讀取天氣中...
            </div>

          ) : weather?.forecast?.forecastday ? (

weather.forecast.forecastday.map((forecast, index) => {

  const day = trip.weather[index];

  return (

    <WeatherDayCard
      key={`${day.id}-${forecast.date}`}
      day={day}
      weather={forecast}
      onEdit={handleEdit}
    />

  );

})

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