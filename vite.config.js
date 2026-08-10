import { defineConfig, loadEnv } from "vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function readGeminiKey(apiEnv = {}) {
  const configDir = path.dirname(fileURLToPath(import.meta.url));
  const keyFile = path.join(configDir, "gemini-key.txt");
  try {
    const key = fs.readFileSync(keyFile, "utf8").trim();
    if (key) return key;
  } catch {}
  return (apiEnv.GEMINI_API_KEY || apiEnv.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
}

function geminiApiPlugin(apiEnv = {}) {
  return {
    name: "travelmate-gemini-api",
    configureServer(server) {
      server.middlewares.use("/api/ai-status", async (req, res, next) => {
        if (req.method !== "GET") return next();
        const apiKey = readGeminiKey(apiEnv);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({
          configured: Boolean(apiKey && apiKey.trim()),
          keyPrefix: apiKey ? apiKey.trim().slice(0, 2) : "",
          keyLength: apiKey ? apiKey.trim().length : 0
        }));
      });

      server.middlewares.use("/api/ai-plan", async (req, res, next) => {
        if (req.method !== "POST") return next();

        try {
          const apiKey = readGeminiKey(apiEnv);
          if (!apiKey) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({
              error: "找不到 GEMINI_API_KEY。請在專案根目錄的 .env 設定 Gemini API Key，然後重新啟動 npm run dev。"
            }));
            return;
          }

          let body = "";
          for await (const chunk of req) body += chunk;
          const input = JSON.parse(body || "{}");

          const destination = input.trip?.destination || "日本";
          const existing = Array.isArray(input.existingItems) && input.existingItems.length
            ? input.existingItems.map((x) =>
                `- ${x.time || "未指定"}｜${x.title || "未命名"}${x.address ? `｜地點：${x.address}` : ""}${x.note ? `｜備註：${x.note}` : ""}`
              ).join("\n")
            : "- 目前沒有已排定的行程。";

          const hotels = Array.isArray(input.hotelGroups)
            ? input.hotelGroups.flatMap((g) => (Array.isArray(g.hotels) ? g.hotels.map((h) => ({
                group: g.title || "",
                name: h.name || g.title || "",
                address: h.address || "",
                checkIn: g.checkIn || "",
                checkOut: g.checkOut || "",
                checkInTime: h.checkInTime || "",
                checkOutTime: h.checkOutTime || "",
              })) : [])).filter((h) => h.checkIn && h.checkOut && input.date >= h.checkIn && input.date < h.checkOut)
            : [];

          const hotelText = hotels.length
            ? hotels.map((h) => `- ${h.name}${h.address ? `｜${h.address}` : ""}${h.checkInTime ? `｜入住 ${h.checkInTime}` : ""}${h.checkOutTime ? `｜退房 ${h.checkOutTime}` : ""}`).join("\n")
            : "- 今天沒有住宿資料。";

          const prompt = `你是 TravelMate 的旅遊行程規劃助手。請規劃 ${destination} 的 ${input.date}（Day ${input.day || ""}）。

可規劃時間：${input.startTime}～${input.endTime}
交通方式：${input.transport}

【已存在行程】
${existing}

【住宿】
${hotelText}

請找出這段時間適合加入的景點、餐廳或活動。不要修改或重複既有行程。必須考慮交通時間、營業時間與行程順路性；不要為了塞滿時間而硬排。若資料不足或不適合增加行程，請明確說明。

這是第一版，先不要要求使用者付款或預訂，也不要自行產生不存在的營業時間。`;

          const schema = {
            type: "OBJECT",
            properties: {
              summary: { type: "STRING" },
              pace: { type: "STRING" },
              warning: { type: "STRING" },
              recommendations: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    time: { type: "STRING" },
                    title: { type: "STRING" },
                    icon: { type: "STRING" },
                    location: { type: "STRING" },
                    duration: { type: "STRING" },
                    travelTime: { type: "STRING" },
                    reason: { type: "STRING" }
                  },
                  required: ["time", "title", "location", "duration", "travelTime", "reason"]
                }
              }
            },
            required: ["summary", "pace", "warning", "recommendations"]
          };

          const geminiResponse = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseMimeType: "application/json",
                  responseSchema: schema
                }
              })
            }
          );

          const raw = await geminiResponse.text();
          let geminiData = {};
          try { geminiData = JSON.parse(raw); } catch {}

          if (!geminiResponse.ok) {
            const message =
              geminiData?.error?.message ||
              `Gemini API 錯誤（${geminiResponse.status}）`;
            res.statusCode = geminiResponse.status;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: message }));
            return;
          }

          const text = geminiData?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || "")
            .join("") || "";

          let result;
          try {
            result = JSON.parse(text);
          } catch {
            result = {
              summary: text || "Gemini 沒有回傳可解析的規劃結果。",
              pace: "",
              warning: "",
              recommendations: []
            };
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(result));
        } catch (error) {
          console.error("Gemini API error:", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({
            error: error?.message || "Gemini AI 規劃失敗"
          }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin(env)],
  };
});
