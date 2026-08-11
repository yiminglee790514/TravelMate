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
