const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";

const geocodeCache = new Map();
const weatherCache = new Map();
const inFlightTripWeather = new Map();

const CITY_ALIASES = {
  "熊本": ["Kumamoto", "Kumamoto City", "Kumamoto-shi"],
  "阿蘇": ["Aso", "Aso City", "Aso-shi"],
  "福岡": ["Fukuoka", "Fukuoka City", "Fukuoka-shi"],
  "博多": ["Hakata", "Hakata-ku", "Fukuoka", "Fukuoka City"],
  "博多區": ["Hakata", "Hakata-ku", "Fukuoka", "Fukuoka City"],
  "福岡小倉": ["Kokura", "Kokura-ku", "Kitakyushu", "Kitakyushu City"],
  "小倉": ["Kokura", "Kokura-ku", "Kitakyushu", "Kitakyushu City"],
  "小倉站": ["Kokura", "Kokura-ku", "Kitakyushu", "Kitakyushu City"],
  "廣島": ["Hiroshima", "Hiroshima City", "Hiroshima-shi"],
  "廣島市": ["Hiroshima", "Hiroshima City", "Hiroshima-shi"],
  "姬路": ["Himeji", "Himeji City", "Himeji-shi"],
  "姫路": ["Himeji", "Himeji City", "Himeji-shi"],
  "姬路市": ["Himeji", "Himeji City", "Himeji-shi"],
  "京都": ["Kyoto", "Kyoto City", "Kyoto-shi"],
  "大阪": ["Osaka", "Osaka City", "Osaka-shi"],
  "奈良": ["Nara", "Nara City", "Nara-shi"],
  "神戶": ["Kobe", "Kobe City", "Kobe-shi"],
  "神戸": ["Kobe", "Kobe City", "Kobe-shi"],
  "名古屋": ["Nagoya", "Nagoya City", "Nagoya-shi"],
  "東京": ["Tokyo", "Tokyo City", "Tokyo-to"],
  "沖繩": ["Okinawa", "Naha"],
  "札幌": ["Sapporo", "Sapporo City", "Sapporo-shi"],
  "仙台": ["Sendai", "Sendai City", "Sendai-shi"],
};

// 日本行程常用地區的固定座標。
// 博多、小倉、姬路等「地區/車站名稱」有時不是 Open-Meteo Geocoding 的城市結果，
// 直接使用市中心座標可以避免「找不到城市」。
const CITY_COORDINATES = {
  "熊本": { latitude: 32.8031, longitude: 130.7079, timezone: "Asia/Tokyo", country: "Japan" },
  "阿蘇": { latitude: 32.9520, longitude: 131.1210, timezone: "Asia/Tokyo", country: "Japan" },
  "博多": { latitude: 33.5902, longitude: 130.4017, timezone: "Asia/Tokyo", country: "Japan" },
  "博多區": { latitude: 33.5902, longitude: 130.4017, timezone: "Asia/Tokyo", country: "Japan" },
  "福岡小倉": { latitude: 33.8869, longitude: 130.8827, timezone: "Asia/Tokyo", country: "Japan" },
  "小倉": { latitude: 33.8869, longitude: 130.8827, timezone: "Asia/Tokyo", country: "Japan" },
  "小倉站": { latitude: 33.8869, longitude: 130.8827, timezone: "Asia/Tokyo", country: "Japan" },
  "姬路": { latitude: 34.8151, longitude: 134.6854, timezone: "Asia/Tokyo", country: "Japan" },
  "姫路": { latitude: 34.8151, longitude: 134.6854, timezone: "Asia/Tokyo", country: "Japan" },
  "姬路市": { latitude: 34.8151, longitude: 134.6854, timezone: "Asia/Tokyo", country: "Japan" },
};


function toIsoDate(date) {
  // 使用本地日期，避免 Asia/Taipei 在午夜轉 UTC 後變成前一天。
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function normalizeCity(city) {
  return String(city || "").trim();
}

async function fetchJson(url, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      let detail = "";
      try {
        detail = await response.text();
      } catch {
        // Ignore response-body parsing errors.
      }
      throw new Error(
        `Weather API Error: ${response.status}${detail ? ` ${detail.slice(0, 180)}` : ""}`
      );
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function geocodeCity(city) {
  const name = normalizeCity(city);
  if (!name) throw new Error("缺少城市名稱");

  const key = name.toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key);

  // 先處理日本行程常見的地區名稱。這些名稱可能是行政區、車站或俗稱，
  // Open-Meteo Geocoding 不一定會回傳可用的城市結果。
  if (CITY_COORDINATES[name]) {
    const location = {
      name,
      ...CITY_COORDINATES[name],
    };
    geocodeCache.set(key, location);
    return location;
  }

  // 中文地名有些 Open-Meteo Geocoding 不一定能直接命中。
  // 先用原名稱搜尋；找不到時再使用常見的日本英文/羅馬拼音別名。
  const candidates = [name, ...(CITY_ALIASES[name] || [])];

  let lastData = null;
  for (const candidate of candidates) {
    const url = new URL(GEOCODING_URL);
    url.searchParams.set("name", candidate);
    url.searchParams.set("count", "10");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");
    // 目前行程主要是日本；對日本地名指定 JP 可避免同名城市選錯。
    if (CITY_ALIASES[name]) url.searchParams.set("countryCode", "JP");

    const data = await fetchJson(url.toString());
    lastData = data;
    const results = data?.results || [];
    if (!results.length) continue;

    const result =
      results.find((item) => item.country_code === "JP" && ["PPL", "PPLA", "PPLA2", "PPLC", "ADM2"].includes(item.feature_code)) ||
      results.find((item) => item.country_code === "JP") ||
      results.find((item) => ["PPL", "PPLA", "PPLA2", "PPLC", "ADM2"].includes(item.feature_code)) ||
      results[0];

    if (!Number.isFinite(Number(result.latitude)) || !Number.isFinite(Number(result.longitude))) {
      continue;
    }

    const location = {
      name: name,
      latitude: Number(result.latitude),
      longitude: Number(result.longitude),
      timezone: result.timezone || "auto",
      country: result.country || "",
    };

    geocodeCache.set(key, location);
    return location;
  }

  throw new Error(`找不到城市：${name}`);
}
export function isForecastDate(dateString, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${dateString}T00:00:00`);
  const lastForecastDay = addDays(today, 15); // 今天 + 15 天 = 最多 16 天
  return date >= today && date <= lastForecastDay;
}

export function getWeatherMode(dateString, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${dateString}T00:00:00`);

  if (date < today) return "historical";
  return isForecastDate(dateString, now) ? "forecast" : "historical-reference";
}

async function getForecastForCity(city, startDate, endDate) {
  const location = await geocodeCity(city);
  const cacheKey = `forecast:${location.latitude}:${location.longitude}:${startDate}:${endDate}`;
  if (weatherCache.has(cacheKey)) return weatherCache.get(cacheKey);

  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", location.latitude);
  url.searchParams.set("longitude", location.longitude);
  url.searchParams.set("daily", [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "apparent_temperature_min",
    "precipitation_sum",
    "precipitation_probability_max",
    "wind_speed_10m_max",
  ].join(","));
  url.searchParams.set("forecast_days", "16");
  url.searchParams.set("timezone", location.timezone || "auto");
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("wind_speed_unit", "kmh");

  const data = await fetchJson(url.toString());
  const result = {};
  const daily = data?.daily;
  if (daily?.time) {
    daily.time.forEach((date, index) => {
      result[date] = {
        date,
        mode: "forecast",
        city,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: data.timezone || location.timezone,
        weatherCode: daily.weather_code?.[index],
        minTemp: daily.temperature_2m_min?.[index],
        maxTemp: daily.temperature_2m_max?.[index],
        apparentMin: daily.apparent_temperature_min?.[index],
        apparentMax: daily.apparent_temperature_max?.[index],
        precipitation: daily.precipitation_sum?.[index],
        precipitationProbability: daily.precipitation_probability_max?.[index],
        windSpeed: daily.wind_speed_10m_max?.[index],
      };
    });
  }

  weatherCache.set(cacheKey, result);
  return result;
}

function buildHistoricalYearRange(dates, years = 10) {
  const parsed = dates.map((date) => new Date(`${date}T00:00:00`));
  const min = new Date(Math.min(...parsed.map((d) => d.getTime())));
  const max = new Date(Math.max(...parsed.map((d) => d.getTime())));
  const currentYear = new Date().getFullYear();

  return {
    yearStart: currentYear - years,
    yearEnd: currentYear - 1,
    monthStart: min.getMonth() + 1,
    dayStart: min.getDate(),
    monthEnd: max.getMonth() + 1,
    dayEnd: max.getDate(),
  };
}

async function getHistoricalReferenceForCity(city, dates) {
  const location = await geocodeCity(city);
  const targetDates = [...new Set(dates)].sort();
  const cacheKey = `historical-ref:${location.latitude}:${location.longitude}:${targetDates.join(",")}`;
  if (weatherCache.has(cacheKey)) return weatherCache.get(cacheKey);

  const range = buildHistoricalYearRange(targetDates, 10);

  /*
   * 不再一次抓 2016/01/01～2025/12/31。
   * 那會下載十年的完整日資料，資料量很大，也容易讓 Archive API
   * 回傳失敗。改成「每一年只抓行程日期所在的月份/日期區間」，
   * 例如 10/21～10/31，就只抓：
   * 2016/10/21～10/31、2017/10/21～10/31 ... 2025/10/21～10/31。
   */
  const yearlyResults = [];

  for (let year = range.yearStart; year <= range.yearEnd; year += 1) {
    const startDate = `${year}-${String(range.monthStart).padStart(2, "0")}-${String(range.dayStart).padStart(2, "0")}`;
    const endDate = `${year}-${String(range.monthEnd).padStart(2, "0")}-${String(range.dayEnd).padStart(2, "0")}`;

    const url = new URL(ARCHIVE_URL);
    url.searchParams.set("latitude", location.latitude);
    url.searchParams.set("longitude", location.longitude);
    url.searchParams.set("start_date", startDate);
    url.searchParams.set("end_date", endDate);
    url.searchParams.set("daily", [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "precipitation_sum",
      "wind_speed_10m_max",
    ].join(","));
    url.searchParams.set("timezone", location.timezone || "Asia/Tokyo");
    url.searchParams.set("temperature_unit", "celsius");
    url.searchParams.set("wind_speed_unit", "kmh");
    url.searchParams.set("models", "era5_land");

    try {
      const data = await fetchJson(url.toString(), 30000);
      if (data?.daily?.time?.length) {
        yearlyResults.push(data.daily);
      }
    } catch (error) {
      // 某一年失敗不讓整個城市失敗，其他年份仍可作為參考。
      console.warn(`Open-Meteo historical year ${year} failed for ${city}:`, error);
    }
  }

  if (!yearlyResults.length) {
    throw new Error("Open-Meteo 歷年同期資料沒有回傳內容");
  }

  const buckets = new Map();

  yearlyResults.forEach((daily) => {
    daily.time.forEach((date, index) => {
      const key = date.slice(5);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push({
        weatherCode: daily.weather_code?.[index],
        minTemp: daily.temperature_2m_min?.[index],
        maxTemp: daily.temperature_2m_max?.[index],
        apparentMin: daily.apparent_temperature_min?.[index],
        apparentMax: daily.apparent_temperature_max?.[index],
        precipitation: daily.precipitation_sum?.[index],
        windSpeed: daily.wind_speed_10m_max?.[index],
      });
    });
  });

  const result = {};

  targetDates.forEach((date) => {
    const values = buckets.get(date.slice(5)) || [];
    if (!values.length) return;

    const average = (field) => {
      const numbers = values
        .map((item) => Number(item[field]))
        .filter(Number.isFinite);

      return numbers.length
        ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length
        : null;
    };

    const codes = values
      .map((item) => Number(item.weatherCode))
      .filter(Number.isFinite);

    const codeCount = codes.reduce((map, code) => {
      map[code] = (map[code] || 0) + 1;
      return map;
    }, {});

    const dominantCode = Object.entries(codeCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    result[date] = {
      date,
      mode: "historical-reference",
      city,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone,
      weatherCode: dominantCode != null ? Number(dominantCode) : null,
      minTemp: average("minTemp"),
      maxTemp: average("maxTemp"),
      apparentMin: average("apparentMin"),
      apparentMax: average("apparentMax"),
      precipitation: average("precipitation"),
      precipitationProbability: null,
      windSpeed: average("windSpeed"),
      sampleYears: values.length,
    };
  });

  weatherCache.set(cacheKey, result);
  return result;
}

async function fetchWeatherForTrip(days) {
  const validDays = (days || []).filter((day) => day?.date && day?.city);
  const byCity = new Map();
  validDays.forEach((day) => {
    if (!byCity.has(day.city)) byCity.set(day.city, []);
    byCity.get(day.city).push(day.date);
  });

  const result = new Map();
  const errors = [];

  await Promise.all(
    [...byCity.entries()].map(async ([city, dates]) => {
      const forecastDates = dates.filter((date) => isForecastDate(date));
      const historicalDates = dates.filter((date) => !isForecastDate(date));

      if (forecastDates.length) {
        try {
          const forecast = await getForecastForCity(
            city,
            forecastDates[0],
            forecastDates[forecastDates.length - 1]
          );
          forecastDates.forEach((date) => {
            if (forecast[date]) result.set(`${city}::${date}`, forecast[date]);
            else errors.push(`${city} ${date}：16 天預報沒有這一天`);
          });
        } catch (error) {
          console.warn(`Open-Meteo forecast failed for ${city}`, error);
          errors.push(`${city}：${error?.message || "16 天預報取得失敗"}`);
        }
      }

      if (historicalDates.length) {
        try {
          const historical = await getHistoricalReferenceForCity(city, historicalDates);
          historicalDates.forEach((date) => {
            if (historical[date]) result.set(`${city}::${date}`, historical[date]);
            else errors.push(`${city} ${date}：找不到歷年同期資料`);
          });
        } catch (error) {
          console.warn(`Open-Meteo historical reference failed for ${city}`, error);
          errors.push(`${city}：${error?.message || "歷年同期資料取得失敗"}`);
        }
      }
    })
  );

  if (validDays.length && result.size === 0 && errors.length) {
    throw new Error(errors.slice(0, 2).join("；"));
  }

  return result;
}

/**
 * 讓不同頁面共用同一份天氣請求。
 * 行程頁進入時會先在背景預載；如果使用者馬上點進天氣頁，
 * 不會再開第二份相同的 API 請求，也能避免 Open-Meteo 被重複呼叫。
 */
export async function getWeatherForTrip(days) {
  const validDays = (days || []).filter((day) => day?.date && day?.city);
  const requestKey = validDays
    .map((day) => `${day.date}|${day.city}`)
    .sort()
    .join(";");

  if (!requestKey) return new Map();

  if (inFlightTripWeather.has(requestKey)) {
    return inFlightTripWeather.get(requestKey);
  }

  const request = fetchWeatherForTrip(validDays).finally(() => {
    inFlightTripWeather.delete(requestKey);
  });

  inFlightTripWeather.set(requestKey, request);
  return request;
}

// 背景預載專用：與天氣頁共用同一份 cache / in-flight request。
export function preloadWeatherForTrip(days) {
  return getWeatherForTrip(days).catch((error) => {
    console.warn("Weather background preload failed:", error);
    return new Map();
  });
}

// 保留給其他舊元件使用：現在改由 Open-Meteo 取得單一城市 16 天預報。
export async function getWeather(city) {
  const today = new Date();
  const data = await getForecastForCity(city, toIsoDate(today), toIsoDate(addDays(today, 15)));
  return Object.values(data);
}
