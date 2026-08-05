const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export async function getWeather(city) {

  const response = await fetch(

    `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=10&lang=zh`

  );

  if (!response.ok) {

    throw new Error("Weather API Error");

  }

  const data = await response.json();

  return data;

}