export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({
          error: "找不到 GOOGLE_MAPS_API_KEY。請在本機 .env 或 Vercel Environment Variables 設定 Google Maps API Key。",
        }), {
          status: 500,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }

      const input = await request.json();
      const query = String(input?.query || "").trim();
      if (!query) {
        return new Response(JSON.stringify({ error: "請輸入景點名稱。" }), {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }

      const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.addressComponents",
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: "zh-TW",
          ...(input?.regionCode ? { regionCode: input.regionCode } : {}),
          maxResultCount: 5,
        }),
      });

      const raw = await response.text();
      let data = {};
      try { data = JSON.parse(raw); } catch {}

      if (!response.ok) {
        return new Response(JSON.stringify({
          error: data?.error?.message || `Google Places 錯誤（${response.status}）`,
        }), {
          status: response.status,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }

      const places = Array.isArray(data?.places) ? data.places.map((place) => ({
        id: place.id || "",
        name: place.displayName?.text || "",
        address: place.formattedAddress || "",
        latitude: place.location?.latitude ?? null,
        longitude: place.location?.longitude ?? null,
        mapsUrl: place.googleMapsUri || "",
        countryCode:
          place.addressComponents?.find((component) =>
            Array.isArray(component.types) && component.types.includes("country")
          )?.shortText || "",
      })) : [];

      return new Response(JSON.stringify({ places }), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: error?.message || "地點搜尋失敗",
      }), {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }
  },
};
