export default function WeatherCard({
  dayNumber,
  date,
  city,
  weather,
}) {

  return (

    <div className="rounded-2xl bg-white p-5 shadow">

      {/* Day */}
      <div className="flex items-center justify-between">

        <div>

          <div className="text-sm font-semibold text-blue-500">
            Day {dayNumber}
          </div>

          <div className="mt-1 text-xl font-bold">
            {date}
          </div>

        </div>

        <div className="text-right">

          <div className="text-xs text-gray-400">
            地點
          </div>

          <div className="font-semibold">
            📍 {city}
          </div>

        </div>

      </div>

      {!weather ? (

        <div className="mt-6 text-center text-gray-400">

          讀取天氣中...

        </div>

      ) : (

        <>

          <div className="mt-6 flex items-center justify-between">

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
              alt=""
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

        </>

      )}

    </div>

  );

}