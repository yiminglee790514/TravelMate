import { useState } from "react";

export default function WeatherDayCard({
  day,
  weather,
  onEdit,
}) {

  const [editing, setEditing] = useState(false);
  const [city, setCity] = useState(day.city);

  return (

    <div className="rounded-2xl bg-white p-5 shadow">

      <div className="flex items-center justify-between">

        <div className="flex-1">

          <div className="text-sm font-semibold text-blue-500">

            {day.date}

          </div>

          {editing ? (

            <div className="mt-3 flex items-center gap-2">

              <input
                className="flex-1 rounded-lg border px-3 py-2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <button
                className="text-green-600 font-bold"
                onClick={() => {

                  onEdit(day, city);

                  setEditing(false);

                }}
              >
                ✔
              </button>

              <button
                className="text-red-600 font-bold"
                onClick={() => {

                  setCity(day.city);

                  setEditing(false);

                }}
              >
                ✖
              </button>

            </div>

          ) : (

            <div className="mt-2 flex items-center gap-3">

              <div className="text-lg font-bold">

                📍 {day.city}

              </div>

              <button
                className="rounded-lg p-1 hover:bg-gray-100"
                onClick={() => setEditing(true)}
              >
                ✏️
              </button>

            </div>

          )}

        </div>

      </div>

      {weather ? (

        <div className="mt-6">

          <div className="flex items-center justify-between">

            <div>

              <div className="text-lg font-semibold">

                {weather.day.condition.text}

              </div>

              <div className="mt-2 text-2xl font-bold">

                {weather.day.mintemp_c}° ~ {weather.day.maxtemp_c}°

              </div>

            </div>

            <img
              src={weather.day.condition.icon}
              alt={weather.day.condition.text}
              className="h-16 w-16"
            />

          </div>

          <div className="mt-5 flex justify-between text-sm text-gray-500">

            <span>

              ☔ {weather.day.daily_chance_of_rain}%

            </span>

            <span>

              💨 {weather.day.maxwind_kph} km/h

            </span>

          </div>

        </div>

      ) : (

        <div className="mt-6 text-gray-400">

          讀取天氣中...

        </div>

      )}

    </div>

  );

}