import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import aiPlanHandler from "./api/ai-plan.js";
import placeSearchHandler from "./api/place-search.js";
import routeTimeHandler from "./api/route-time.js";

async function callApiHandler(req, res, handler) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const body = Buffer.concat(chunks);

  const request = new Request(
    `http://${req.headers.host || "localhost:5173"}${req.url}`,
    {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
      },
      body: body.length ? body : undefined,
    }
  );

  const response = await handler.fetch(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

function localApiPlugin(env) {
  return {
    name: "travelmate-local-api",

    configureServer(server) {
      process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
      process.env.GOOGLE_MAPS_API_KEY = env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";

      const handlers = {
        "/api/ai-plan": aiPlanHandler,
        "/api/place-search": placeSearchHandler,
        "/api/route-time": routeTimeHandler,
      };

      for (const [route, handler] of Object.entries(handlers)) {
        server.middlewares.use(route, async (req, res, next) => {
          if (req.method !== "POST") return next();

          try {
            await callApiHandler(req, res, handler);
          } catch (error) {
            console.error(`Local API error (${route}):`, error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({
              error: error?.message || "本機 API 發生錯誤",
            }));
          }
        });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  console.log(
    "Gemini API Key:",
    env.GEMINI_API_KEY
      ? `已讀取（${env.GEMINI_API_KEY.length} 字元）`
      : "❌ 沒有讀到"
  );

  console.log(
    "Google Maps API Key:",
    env.GOOGLE_MAPS_API_KEY ? "已讀取" : "⚠️ 尚未設定（地址自動搜尋／路線時間暫不可用）"
  );

  return {
    plugins: [
      react(),
      tailwindcss(),
      localApiPlugin(env),
    ],
  };
});
