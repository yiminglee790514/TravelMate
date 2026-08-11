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
 * 取得 Google Maps 路線中的單一地點。
 * 僅接受真正地址；沒有地址的行程不進入 Google Maps 路線。
 */
function getGoogleMapsPoint(item) {
  // Google Maps 路線只接受真正的地址。
  // 不再把 place_id、景點名稱或其他無地址資料塞進路線 URL。
  const address = String(item?.address || "").trim();
  return address || "";
}

/**
 * 建立目前這一天的 Google Maps 多點路線。
 *
 * 規則：
 * 1. 只使用有地址的行程。
 * 2. 如果旅程有設定國家，只匯入該國的地址。
 * 3. 不使用城市作為搜尋條件。
 * 4. 不使用 place_id:xxxx 作為路線點。
 */
export function getGoogleMapsDayItems(items = [], country = "") {
  return items.filter((item) => isItemInCountry(item, country));
}

export function buildGoogleMapsDayUrl(items = [], { country = "" } = {}) {
  const validItems = getGoogleMapsDayItems(items, country);
  const points = validItems.map(getGoogleMapsPoint).filter(Boolean);

  if (points.length < 2) {
    const countryText = country ? `「${country}」` : "";
    throw new Error(
      `這一天至少需要 2 個${countryText}且有完整地址的行程，才能建立 Google Maps 路線。`
    );
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

export function openGoogleMapsDayRoute(items = [], options = {}) {
  const url = buildGoogleMapsDayUrl(items, options);
  window.open(url, "_blank", "noopener,noreferrer");
  return url;
}
