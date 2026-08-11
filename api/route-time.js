function parseDurationSeconds(value) {
  const match = String(value || "").match(/^(\d+(?:\.\d+)?)s$/);
  return match ? Number(match[1]) : 0;
}

function formatDuration(seconds) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `約 ${minutes} 分鐘`;
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  return remain ? `約 ${hours} 小時 ${remain} 分鐘` : `約 ${hours} 小時`;
}

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
      const origin = String(input?.origin || "").trim();
      const destination = String(input?.destination || "").trim();
      const mode = String(input?.mode || "DRIVE").toUpperCase();

      const allowedModes = new Set(["DRIVE", "TRANSIT", "WALK", "BICYCLE", "TWO_WHEELER"]);
      const travelMode = allowedModes.has(mode) ? mode : "DRIVE";

      if (!origin || !destination) {
        return new Response(JSON.stringify({ error: "起點與終點都需要地址。" }), {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }

      const body = {
        origin: { address: origin },
        destination: { address: destination },
        travelMode,
        languageCode: "zh-TW",
        units: "METRIC",
        ...(input?.regionCode ? { regionCode: input.regionCode } : {}),
      };

      // Google Routes API 的 routingPreference 只能用在 DRIVE / TWO_WHEELER。
      // TRANSIT / WALK / BICYCLE 不要帶這個欄位，否則 request 會直接失敗。
      if (travelMode === "DRIVE") {
        body.routingPreference = "TRAFFIC_AWARE";
      }

      // 只有大眾運輸需要指定出發時間；其他模式不需要。
      if (travelMode === "TRANSIT" && input?.departureTime) {
        const departure = new Date(input.departureTime);
        if (!Number.isNaN(departure.getTime())) {
          body.departureTime = departure.toISOString();
        }

        // 大眾運輸有時會有多條可行路線，讓 Google 有機會回傳替代路線。
        body.computeAlternativeRoutes = true;
      }

      const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": [
            "routes.duration",
            "routes.distanceMeters",
            "routes.localizedValues",
            "routes.legs.steps.travelMode",
            "routes.legs.steps.transitDetails",
          ].join(","),
        },
        body: JSON.stringify(body),
      });

      const raw = await response.text();
      let data = {};
      try { data = JSON.parse(raw); } catch {}

      if (!response.ok) {
        return new Response(JSON.stringify({
          error: data?.error?.message || `Google Routes 錯誤（${response.status}）`,
        }), {
          status: response.status,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }

      const route = data?.routes?.[0];
      if (!route) {
        const modeMessages = {
          TRANSIT: "Google 目前找不到這個時間的公共交通路線，請改成開車或步行，或稍後再試。",
          BICYCLE: "Google 目前找不到這段路的單車路線；單車路線屬於 Beta，部分地區可能沒有資料。",
          TWO_WHEELER: "Google 目前沒有提供這段路的機車路線；機車路線並非所有國家／地區都有支援。",
          WALK: "Google 目前找不到這段路的步行路線。",
          DRIVE: "Google 目前找不到可用的開車路線。",
        };

        return new Response(JSON.stringify({
          error: modeMessages[travelMode] || "找不到可用路線。",
          code: "NO_ROUTE",
          mode: travelMode,
        }), {
          status: 404,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }

      const seconds = parseDurationSeconds(route.duration);
      const localizedDuration = route.localizedValues?.duration?.text || formatDuration(seconds);
      const localizedDistance = route.localizedValues?.distance?.text ||
        (Number.isFinite(route.distanceMeters) ? `${(route.distanceMeters / 1000).toFixed(1)} 公里` : "");

      return new Response(JSON.stringify({
        durationSeconds: seconds,
        durationText: localizedDuration,
        distanceMeters: route.distanceMeters || 0,
        distanceText: localizedDistance,
        mode: travelMode,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: error?.message || "路線時間計算失敗",
      }), {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }
  },
};
