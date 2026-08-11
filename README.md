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


## UI 改版後的 Google Maps 功能

本版本新增兩個功能：

1. 新增行程時，可以依「景點名稱 + 國家／城市」自動搜尋地址。
2. 同一天兩個行程之間，會依交通工具計算預估時間，可選開車、大眾運輸、步行、單車、機車。

這兩項功能使用 Google Places API (New) 與 Google Routes API。正式使用前，需要在本機 `.env` 與 Vercel Environment Variables 設定：

```text
GOOGLE_MAPS_API_KEY=你的 Google Maps Platform API Key
```

Gemini 的 `GEMINI_API_KEY` 不等於 Google Maps API Key，兩者請分開設定。Google 官方文件：Places Text Search、Routes API。
