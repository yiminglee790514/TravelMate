const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";

const geocodeCache = new Map();
const weatherCache = new Map();
const weatherTripInflight = new Map();

const CITY_ALIASES = {
  "熊本": { ja: ["熊本"], en: ["Kumamoto", "Kumamoto City"] },
  "阿蘇": { ja: ["阿蘇"], en: ["Aso", "Aso City"] },
  "福岡": { ja: ["福岡"], en: ["Fukuoka", "Fukuoka City"] },
  "博多": { ja: ["博多", "博多区"], en: ["Hakata", "Hakata-ku", "Fukuoka"] },
  "博多區": { ja: ["博多", "博多区"], en: ["Hakata", "Hakata-ku", "Fukuoka"] },
  "福岡小倉": { ja: ["小倉", "小倉区"], en: ["Kokura", "Kokura-ku", "Kitakyushu", "Kitakyushu City"] },
  "小倉": { ja: ["小倉", "小倉区"], en: ["Kokura", "Kokura-ku", "Kitakyushu", "Kitakyushu City"] },
  "小倉站": { ja: ["小倉", "小倉駅"], en: ["Kokura", "Kokura Station", "Kitakyushu"] },
  "廣島": { ja: ["広島", "広島市"], en: ["Hiroshima", "Hiroshima City"] },
  "廣島市": { ja: ["広島", "広島市"], en: ["Hiroshima", "Hiroshima City"] },
  "姬路": { ja: ["姫路", "姫路市"], en: ["Himeji", "Himeji City"] },
  "姫路": { ja: ["姫路", "姫路市"], en: ["Himeji", "Himeji City"] },
  "姬路市": { ja: ["姫路", "姫路市"], en: ["Himeji", "Himeji City"] },
  "京都": { ja: ["京都", "京都市"], en: ["Kyoto", "Kyoto City"] },
  "大阪": { ja: ["大阪", "大阪市"], en: ["Osaka", "Osaka City"] },
  "奈良": { ja: ["奈良", "奈良市"], en: ["Nara", "Nara City"] },
  "神戶": { ja: ["神戸", "神戸市"], en: ["Kobe", "Kobe City"] },
  "神戸": { ja: ["神戸", "神戸市"], en: ["Kobe", "Kobe City"] },
  "名古屋": { ja: ["名古屋", "名古屋市"], en: ["Nagoya", "Nagoya City"] },
  "東京": { ja: ["東京", "東京都"], en: ["Tokyo", "Tokyo City"] },
  "沖繩": { ja: ["沖縄", "那覇"], en: ["Okinawa", "Naha"] },
  "札幌": { ja: ["札幌", "札幌市"], en: ["Sapporo", "Sapporo City"] },
  "仙台": { ja: ["仙台", "仙台市"], en: ["Sendai", "Sendai City"] },
};

function normalizeCity(city) {
  return String(city || "").trim();
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))];
}

function getSearchPlan(name) {
  const aliases = CITY_ALIASES[name] || { ja: [], en: [] };
  const plan = [];

  // ① 第一優先：直接用使用者輸入的中文/原始名稱搜尋。
  plan.push({ name, language: "zh" });

  // ② 找不到才用日文名稱搜尋。
  uniqueStrings(aliases.ja).forEach((candidate) => {
    if (candidate !== name) plan.push({ name: candidate, language: "ja" });
  });

  // ③ 最後才用英文 / 羅馬拼音搜尋。
  uniqueStrings(aliases.en).forEach((candidate) => {
    if (candidate !== name) plan.push({ name: candidate, language: "en" });
  });

  return plan;
}

function scoreGeocodeResult(result, query, allQueries) {
  if (result?.country_code !== "JP") return -Infinity;
  if (!Number.isFinite(Number(result?.latitude)) || !Number.isFinite(Number(result?.longitude))) {
    return -Infinity;
  }

  const queryText = String(query || "").trim().toLowerCase();
  const searchable = [
    result.name,
    result.admin1,
    result.admin2,
    result.admin3,
    result.admin4,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  let score = 0;

  // 不再限制 feature_code，只把名稱吻合度與人口當成排序依據。
  if (searchable.includes(queryText)) score += 1000;
  if (searchable.some((value) => value === queryText)) score += 500;
  if (searchable.some((value) => value.includes(queryText) || queryText.includes(value))) score += 150;

  const aliasIndex = allQueries.findIndex(
    (value) => String(value).trim().toLowerCase() === queryText
  );
  if (aliasIndex >= 0) score += Math.max(0, 120 - aliasIndex * 10);

  const population = Number(result.population);
  if (Number.isFinite(population) && population > 0) {
    score += Math.min(120, Math.log10(population) * 12);
  }

  return score;
}

async function geocodeCity(city) {
  const name = normalizeCity(city);
  if (!name) throw new Error("缺少城市名稱");

  const key = name.toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key);

  const plan = getSearchPlan(name);
  const allQueries = plan.map((item) => item.name);
  let bestResult = null;
  let bestScore = -Infinity;
  let lastError = null;

  for (const search of plan) {
    const url = new URL(GEOCODING_URL);
    url.searchParams.set("name", search.name);
    url.searchParams.set("count", "10");
    url.searchParams.set("language", search.language);
    url.searchParams.set("format", "json");
    // 日本行程限定日本，避免同名地區跑到其他國家。
    url.searchParams.set("countryCode", "JP");

    try {
      const data = await fetchJson(url.toString());
      const results = data?.results || [];
      if (!results.length) continue;

      results.forEach((result) => {
        const score = scoreGeocodeResult(result, search.name, allQueries);
        if (score > bestScore) {
          bestScore = score;
          bestResult = result;
        }
      });

      // 找到原始名稱的日本結果，就不必再用別名搜尋，降低 API 請求數量。
      if (bestResult && search.name === name) break;
      // 找到高可信度的日文/英文結果也可以停止繼續搜尋。
      if (bestResult && bestScore >= 1000) break;
    } catch (error) {
      lastError = error;
      // Geocoding 某次查詢失敗時，仍嘗試下一個語言/別名。
    }
  }

  if (!bestResult) {
    if (lastError?.message?.includes("429")) {
      throw new Error(`地區搜尋暫時超過 API 限制：${name}，請稍後再試`);
    }
    throw new Error(`找不到城市：${name}`);
  }

  const location = {
    name,
    latitude: Number(bestResult.latitude),
    longitude: Number(bestResult.longitude),
    timezone: bestResult.timezone || "Asia/Tokyo",
    country: bestResult.country || "Japan",
  };

  geocodeCache.set(key, location);
  return location;
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

  // 一個城市只送一次 Archive API 請求，抓取 10 年的「同月份區間」。
  // 例如 10/21～10/31 只需要 2016/10/21～2025/10/31 的資料，
  // 再從回傳資料中挑出每年相同月日來平均。比逐年送 10 次請求更快。
  const startDate = `${range.yearStart}-${String(range.monthStart).padStart(2, "0")}-${String(range.dayStart).padStart(2, "0")}`;
  const endDate = `${range.yearEnd}-${String(range.monthEnd).padStart(2, "0")}-${String(range.dayEnd).padStart(2, "0")}`;

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

  const data = await fetchJson(url.toString(), 30000);
  const daily = data?.daily;
  if (!daily?.time?.length) {
    throw new Error("Open-Meteo 歷年同期資料沒有回傳內容");
  }

  const buckets = new Map();
  daily.time.forEach((date, index) => {
    const key = date.slice(5);
    // 只保留實際需要的月日，避免處理整段 10 年資料。
    if (!targetDates.some((target) => target.slice(5) === key)) return;
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

function weatherTripCacheKey(days) {
  return (days || [])
    .filter((day) => day?.date && day?.city)
    .map((day) => `${day.date}|${normalizeCity(day.city)}`)
    .sort()
    .join(";");
}

export async function getWeatherForTrip(days) {
  const validDays = (days || []).filter((day) => day?.date && day?.city);
  if (!validDays.length) return new Map();

  const tripKey = weatherTripCacheKey(validDays);
  if (weatherTripInflight.has(tripKey)) {
    return weatherTripInflight.get(tripKey);
  }

  const promise = (async () => {
    const byCity = new Map();
    validDays.forEach((day) => {
      if (!byCity.has(day.city)) byCity.set(day.city, []);
      byCity.get(day.city).push(day.date);
    });

    const result = new Map();
    const errors = [];

    // 不同城市並行抓取，避免熊本完成後才開始抓博多、姬路。
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
  })();

  weatherTripInflight.set(tripKey, promise);
  try {
    return await promise;
  } finally {
    weatherTripInflight.delete(tripKey);
  }
}

// 背景預載：頁面還沒切到「天氣」前就先把資料抓進記憶體快取。
// 不 await 也不阻塞目前頁面；使用者進入天氣頁時會直接命中同一個請求。
export function buildWeatherDaysForTrip(trip) {
  if (!trip?.startDate || !trip?.endDate) return [];

  const existing = Array.isArray(trip.weather) ? trip.weather : [];
  const result = [];
  const start = new Date(`${trip.startDate}T00:00:00`);
  const end = new Date(`${trip.endDate}T00:00:00`);

  for (let current = new Date(start); current <= end; current = addDays(current, 1)) {
    const date = toIsoDate(current);
    const old = existing.find((item) => item.date === date);
    result.push(old || {
      id: `${date}-prefetch`,
      date,
      city: trip.city || "",
    });
  }

  return result.filter((day) => day.city);
}

export function prefetchWeatherForTrip(days) {
  if (!Array.isArray(days) || !days.length) return;
  void getWeatherForTrip(days).catch((error) => {
    console.warn("Weather background prefetch failed:", error);
  });
}

// 保留給其他舊元件使用：現在改由 Open-Meteo 取得單一城市 16 天預報。
export async function getWeather(city) {
  const today = new Date();
  const data = await getForecastForCity(city, toIsoDate(today), toIsoDate(addDays(today, 15)));
  return Object.values(data);
}
