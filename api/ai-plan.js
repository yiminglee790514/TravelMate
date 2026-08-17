export default {
  async fetch(request) {
    // 只允許 POST
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Method Not Allowed"
        }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
    }

    try {
      // Gemini API Key 輪替：GEMINI_API_KEY ～ GEMINI_API_KEY_5
      // 每次請求先從不同 Key 開始；若遇到 429 / 403，再自動切換下一把 Key。
      const apiKeys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5,
      ].filter(Boolean);

      if (!apiKeys.length) {
        return new Response(
          JSON.stringify({
            error: "找不到 Gemini API Key。請確認 GEMINI_API_KEY ～ GEMINI_API_KEY_5 已設定。"
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          }
        );
      }

      // 讓連續請求平均分散到不同 Key。
      // Vercel 每個執行個體各自維護 index，但即使如此也能降低單一 Key 被集中打爆的機率。
      globalThis.__travelMateGeminiKeyIndex =
        (globalThis.__travelMateGeminiKeyIndex || 0) + 1;
      const startIndex =
        (globalThis.__travelMateGeminiKeyIndex - 1) % apiKeys.length;

      const input = await request.json();

      const destination =
        input.trip?.destination || "旅遊目的地";

      const existing =
        Array.isArray(input.existingItems) &&
        input.existingItems.length
          ? input.existingItems
              .map(
                (x) =>
                  `- ${x.time || "未指定時間"} ${x.title || "未命名行程"}${
                    x.address ? `，地址：${x.address}` : ""
                  }${x.note ? `，備註：${x.note}` : ""}`
              )
              .join("\n")
          : "- 今天目前沒有既有行程。";

      const hotels = Array.isArray(input.hotelGroups)
        ? input.hotelGroups
            .flatMap((g) =>
              Array.isArray(g.hotels)
                ? g.hotels.map((h) => ({
                    group: g.title || "",
                    name: h.name || g.title || "",
                    address: h.address || "",
                    checkIn: g.checkIn || "",
                    checkOut: g.checkOut || "",
                    checkInTime: h.checkInTime || "",
                    checkOutTime: h.checkOutTime || ""
                  }))
                : []
            )
            .filter(
              (h) =>
                h.checkIn &&
                h.checkOut &&
                input.date >= h.checkIn &&
                input.date < h.checkOut
            )
        : [];

      const hotelText = hotels.length
        ? hotels
            .map(
              (h) =>
                `- ${h.name}${
                  h.address ? `，${h.address}` : ""
                }${
                  h.checkInTime
                    ? `，入住：${h.checkInTime}`
                    : ""
                }${
                  h.checkOutTime
                    ? `，退房：${h.checkOutTime}`
                    : ""
                }`
            )
            .join("\n")
        : "- 今天沒有符合日期的住宿資料。";

      const prompt = `
你是 TravelMate 的 AI 旅遊規劃助手。

請根據使用者目前的行程，協助安排今天剩餘時間的旅遊行程。

目的地：${destination}
日期：${input.date || ""}
Day：${input.day || ""}

開始時間：${input.startTime || ""}
結束時間：${input.endTime || ""}
交通方式：${input.transport || "不限 / 混合"}

目前已經存在的行程：
${existing}

今天住宿：
${hotelText}

請遵守以下規則：

1. 不要修改使用者已經存在的行程。
2. 不要安排與既有行程時間衝突的行程。
3. 必須考慮開始時間與結束時間。
4. 必須考慮交通方式。
5. 景點之間要保留合理的交通時間。
6. 行程不要排得太滿。
7. 如果時間不足，不要硬塞景點。
8. 優先推薦適合旅遊、具有代表性的景點。
9. 如果是家庭旅遊，避免過度緊湊。
10. 每個推薦行程都要提供合理的停留時間與交通時間。
11. 不要捏造明確不存在的景點。
12. 回傳 JSON，不要加入 Markdown。

請輸出：
- summary：今天整體行程建議
- pace：行程節奏
- warning：注意事項
- recommendations：推薦行程

recommendations 每筆包含：
time
title
icon
location
duration
travelTime
reason
`;

      const schema = {
        type: "OBJECT",
        properties: {
          summary: {
            type: "STRING"
          },
          pace: {
            type: "STRING"
          },
          warning: {
            type: "STRING"
          },
          recommendations: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                time: {
                  type: "STRING"
                },
                title: {
                  type: "STRING"
                },
                icon: {
                  type: "STRING"
                },
                location: {
                  type: "STRING"
                },
                duration: {
                  type: "STRING"
                },
                travelTime: {
                  type: "STRING"
                },
                reason: {
                  type: "STRING"
                }
              },
              required: [
                "time",
                "title",
                "location",
                "duration",
                "travelTime",
                "reason"
              ]
            }
          }
        },
        required: [
          "summary",
          "pace",
          "warning",
          "recommendations"
        ]
      };

      let geminiResponse = null;
      let geminiData = {};
      let lastErrorMessage = "Gemini API 發生錯誤";
      let lastErrorStatus = 500;

      // 最多依序嘗試目前可用的 5 把 Key。
      // 429：代表目前 Key 達到限制，立刻換下一把。
      // 401/403：通常代表 Key 無效或沒有權限，也換下一把，避免整個 AI 功能直接失效。
      for (let attempt = 0; attempt < apiKeys.length; attempt += 1) {
        const keyIndex = (startIndex + attempt) % apiKeys.length;
        const apiKey = apiKeys[keyIndex];

        try {
          geminiResponse = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: prompt
                      }
                    ]
                  }
                ],
                generationConfig: {
                  responseMimeType: "application/json",
                  responseSchema: schema
                }
              })
            }
          );

          const raw = await geminiResponse.text();

          try {
            geminiData = JSON.parse(raw);
          } catch {
            geminiData = {};
          }

          if (geminiResponse.ok) {
            break;
          }

          lastErrorStatus = geminiResponse.status;
          lastErrorMessage =
            geminiData?.error?.message ||
            `Gemini API 錯誤：${geminiResponse.status}`;

          // 只有配額／權限類錯誤才換 Key；其他錯誤直接回傳，避免重複送出相同請求。
          if (![401, 403, 429].includes(geminiResponse.status)) {
            break;
          }

          console.warn(
            `Gemini API Key ${keyIndex + 1}/${apiKeys.length} 失敗（${geminiResponse.status}），切換下一把 Key。`
          );
        } catch (error) {
          lastErrorStatus = 500;
          lastErrorMessage = error?.message || "Gemini API 連線失敗";
          console.warn(
            `Gemini API Key ${keyIndex + 1}/${apiKeys.length} 連線失敗，切換下一把 Key。`,
            error
          );
        }
      }

      if (!geminiResponse?.ok) {
        return new Response(
          JSON.stringify({
            error: lastErrorMessage
          }),
          {
            status: lastErrorStatus,
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          }
        );
      }

      const text =
        geminiData?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("") || "";

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        result = {
          summary:
            text || "Gemini 沒有回傳有效的 AI 規劃結果。",
          pace: "",
          warning: "",
          recommendations: []
        };
      }

      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );

    } catch (error) {
      console.error("Gemini API error:", error);

      return new Response(
        JSON.stringify({
          error:
            error?.message ||
            "Gemini AI 發生未知錯誤"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
    }
  }
};