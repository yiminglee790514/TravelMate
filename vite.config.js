import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import aiPlanHandler from "./api/ai-plan.js";

function localApiPlugin(env) {
  return {
    name: "travelmate-local-api",

    configureServer(server) {
      // 明確設定本機 Gemini API Key
      process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;

      server.middlewares.use("/api/ai-plan", async (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }

        try {
          const chunks = [];

          for await (const chunk of req) {
            chunks.push(Buffer.from(chunk));
          }

          const body = Buffer.concat(chunks);

          const request = new Request(
            `http://${req.headers.host || "localhost:5173"}${req.url}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body,
            }
          );

          const response = await aiPlanHandler.fetch(request);

          res.statusCode = response.status;

          response.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });

          const responseBody = Buffer.from(
            await response.arrayBuffer()
          );

          res.end(responseBody);

        } catch (error) {
          console.error("Local AI API error:", error);

          res.statusCode = 500;

          res.setHeader(
            "Content-Type",
            "application/json; charset=utf-8"
          );

          res.end(
            JSON.stringify({
              error:
                error?.message ||
                "本機 Gemini AI API 發生錯誤",
            })
          );
        }
      });
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

  return {
    plugins: [
      react(),
      tailwindcss(),
      localApiPlugin(env),
    ],
  };
});