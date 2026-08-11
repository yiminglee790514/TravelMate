import { isItemInCountry } from "./mapsCountry";

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `地圖服務錯誤（${response.status}）`);
  }
  return data;
}

export async function searchPlaceAddress({ query, regionCode = "" }) {
  if (!query?.trim()) throw new Error("請先輸入景點名稱");
  return requestJson("/api/place-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: query.trim(), regionCode }),
  });
}

export async function calculateTravelTime({
  origin,
  destination,
  mode = "DRIVE",
  departureTime = "",
  regionCode = "",
}) {
  if (!origin?.trim() || !destination?.trim()) {
    throw new Error("起點與終點都需要地址");
  }

  return requestJson("/api/route-time", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origin: origin.trim(),
      destination: destination.trim(),
      mode,
      departureTime,
      regionCode,
    }),
  });
}

/**
 * 建立目前這一天的 Google Maps 多點路線。
 * 優先使用 Place ID，沒有 Place ID 才使用地址／名稱。
 */
function getGoogleMapsPoint(item) {
  // Google Maps 路線一律優先使用「地址」，不要再把 Place ID
  // 直接塞進網址，否則 Google Maps 會顯示 place_id:ChIJ...。
  const address = String(item?.address || "").trim();
  if (address) return address;

  return String(item?.title || item?.name || "").trim();
}

export function buildGoogleMapsDayUrl(items = [], trip = null) {
  // Google Maps 自動帶入只收：
  // 1. 有地址
  // 2. 屬於目前旅程國家
  const eligibleItems = items.filter((item) => {
    if (!String(item?.address || "").trim()) return false;
    return isItemInCountry(item, trip?.country || "");
  });

  const points = eligibleItems.map(getGoogleMapsPoint).filter(Boolean);

  if (points.length < 2) {
    throw new Error("這一天至少需要 2 個有地點資料的行程，才能建立 Google Maps 路線。");
  }

  const params = new URLSearchParams({
    api: "1",
    origin: points[0],
    destination: points[points.length - 1],
    travelmode: "driving",
  });

  const waypoints = points.slice(1, -1);
  if (waypoints.length) params.set("waypoints", waypoints.join("|"));

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function openGoogleMapsDayRoute(items = [], trip = null) {
  const url = buildGoogleMapsDayUrl(items, trip);
  window.open(url, "_blank", "noopener,noreferrer");
  return url;
}
