import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";
import { getWeather } from "../services/weatherService";
import { canEdit } from "../services/permissionService";

import WeatherDayCard from "../components/WeatherDayCard";

export default function WeatherPage() {

  const { id, shareId } = useParams();

  const {
    trip: cloudTrip,
    updateTrip,
  } = useTrip(id);

  const [trip, setTrip] = useState(null);

  const readonly =
    !!shareId ||
    (trip ? !canEdit(trip) : true);

  const [, forceUpdate] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    async function loadTrip() {

      let data;

      if (shareId) {

        data = await getShare(shareId);

      } else {

        data = cloudTrip;

      }

      if (!data) return;

      if (!data.weather) {

        data.weather = [];

      }

      const start = new Date(data.startDate);
const end = new Date(data.endDate);

const weather = [];

const current = new Date(start);

while (current <= end) {

  const date = current.toISOString().split("T")[0];

  const old = data.weather.find(
    (item) => item.date === date
  );

  weather.push(

    old || {

      id: Date.now() + weather.length,

      date,

      city: data.city,

    }

  );

  current.setDate(current.getDate() + 1);

}

const changed =
  weather.length !== data.weather.length ||
  weather.some((w, i) => w.date !== data.weather[i]?.date);

if (changed) {

  data = {

    ...data,

    weather,

  };

  if (!shareId) {

    await updateTrip(data);

  }

}

      setTrip(data);

      data.weather.forEach((day) => {

        if (!day.forecast) {

          loadForecast(day, data);

        }

      });

    }

    loadTrip();

  }, [cloudTrip, shareId]);

  async function loadForecast(day, currentTrip) {

    const data = await getWeather(day.city);

    if (!data?.forecast?.forecastday?.length) return;

    const forecast = data.forecast.forecastday.find(

      (f) => f.date === day.date

    );

    day.forecast = forecast || data.forecast.forecastday[0];

    if (!shareId) {

      await updateTrip({

        ...currentTrip,

        weather: [...currentTrip.weather],

      });

    }

    forceUpdate((v) => v + 1);

  }

async function handleEdit(day, newCity) {

  if (readonly) return;

  const weather = trip.weather.map((item) => ({

    ...item,

    city: newCity,

    forecast: null,

  }));

  const updatedTrip = {

    ...trip,

    city: newCity,

    weather,

  };

  setTrip(updatedTrip);

  if (!shareId) {

    await updateTrip(updatedTrip);

  }

  for (const item of weather) {

    await loadForecast(item, updatedTrip);

  }

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
            shareId
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