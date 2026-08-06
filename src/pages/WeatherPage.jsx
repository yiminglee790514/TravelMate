import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import tripService from "../services/tripService";
import { getShare } from "../services/shareService";
import { getWeather } from "../services/weatherService";

import WeatherDayCard from "../components/WeatherDayCard";

export default function WeatherPage() {

  const { id, shareId } = useParams();

  const readonly = !!shareId;

  const [trip, setTrip] = useState(null);

  const [, forceUpdate] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    async function loadTrip() {

      let data;

      if (readonly) {

        data = await getShare(shareId);

      } else {

        data = tripService.getTrip(id);

      }

      if (!data.weather) {

        data.weather = [];

      }

      if (data.weather.length === 0) {

        const start = new Date(data.startDate);

        const end = new Date(data.endDate);

        const weather = [];

        const current = new Date(start);

        while (current <= end) {

          weather.push({

            id: Date.now() + weather.length,

            date: current.toISOString().split("T")[0],

            city: data.city,

          });

          current.setDate(current.getDate() + 1);

        }

        data.weather = weather;

        if (!readonly) {

          tripService.updateTrip(data);

        }

      }

      setTrip(data);

      data.weather.forEach((day) => {

        if (!day.forecast) {

          loadForecast(day);

        }

      });

    }

    loadTrip();

  }, [id, shareId, readonly]);

  async function loadForecast(day) {

    const data = await getWeather(day.city);

    if (!data?.forecast?.forecastday?.length) return;

    const forecast = data.forecast.forecastday.find(

      (f) => f.date === day.date

    );

    day.forecast = forecast || data.forecast.forecastday[0];

    if (!readonly) {

      tripService.updateTrip(trip);

    }

    forceUpdate((v) => v + 1);

  }

  async function handleEdit(day, newCity) {

    if (readonly) return;

    day.city = newCity;

    day.forecast = null;

    tripService.updateTrip(trip);

    await loadForecast(day);

  }

  if (!trip) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        載入中...

      </div>

    );

  }

return (

  <div className="min-h-screen bg-gray-100">

    <div className="mx-auto max-w-md px-6 py-10">

      <Link
        to={
          readonly
            ? `/share/${shareId}`
            : `/trip/${id}`
        }
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

          trip.weather.map((day) => (

            <WeatherDayCard
              key={day.id}
              day={day}
              weather={day.forecast}
              readonly={readonly}
              onEdit={handleEdit}
            />

          ))

        )}

      </div>

    </div>

  </div>

);

}