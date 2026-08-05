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
  const [, forceUpdate] = useState(0);
  const [loading, setLoading] = useState(false);

async function loadForecast(day, index) {

  const data = await getWeather(day.city);
    console.log("day =", day.date);
    console.log("index =", index);
    console.log("API 日期 =", data.forecast.forecastday.map(f => f.date));

  if (!data?.forecast?.forecastday?.length) return;

  day.forecast =
    data.forecast.forecastday[index] ||
    data.forecast.forecastday[0];

  tripService.updateTrip(trip);

  forceUpdate(v => v + 1);

}

async function handleEdit(day, newCity) {

  const index = trip.weather.findIndex(
    (item) => item.id === day.id
  );

  if (index === -1) return;

  day.city = newCity;

  day.forecast = null;

  tripService.updateTrip(trip);

  await loadForecast(day, index);

}

useEffect(() => {

  if (!trip) return;

  generateWeatherDays();

    trip.weather.forEach((day, index) => {

    if (!day.forecast) {

        loadForecast(day, index);

    }

    });

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

  ) : (

    <>
      {trip.weather.map((day) => (

        <WeatherDayCard
          key={`${day.date}-${day.city}`}
          day={day}
          weather={day.forecast}
          onEdit={handleEdit}
        />

      ))}
    </>

  )}

</div>

      </div>

    </div>

  );

}