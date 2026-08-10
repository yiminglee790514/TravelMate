# TravelMate Gemini AI

## Gemini API 設定

1. 在專案根目錄建立或修改 `.env`。
2. 加入：

```text
GEMINI_API_KEY=你的Gemini_API_Key
```

3. 完全停止目前的 `npm run dev`。
4. 重新執行 `npm run dev`。
5. 瀏覽器開啟 `http://localhost:5173/api/ai-status`，應看到 `configured: true`。這個頁面不會顯示完整 Key。
6. 回 TravelMate 按 🤖 再測試。

此版本支援 Google AI Studio 目前的新 Auth Key（例如 AQ 開頭），使用 `x-goog-api-key` 呼叫 Gemini API。

**安全提醒：API Key 不要貼到聊天、GitHub 或前端程式碼。若 Key 已經公開，請立即在 Google AI Studio 撤銷並重新建立一把。**


## Gemini API Key
把 Gemini API Key 貼到專案根目錄的 `gemini-key.txt`，只有一行，不要加引號。這個檔案只在本機 Vite 伺服器讀取，不會送到前端。修改後重新執行 `npm run dev`。
