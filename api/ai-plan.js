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
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return new Response(
          JSON.stringify({
            error: "找不到 GEMINI_API_KEY，請確認 Vercel Environment Variables。"
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          }
        );
      }

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

      const geminiResponse = await fetch(
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

      let geminiData = {};

      try {
        geminiData = JSON.parse(raw);
      } catch {
        geminiData = {};
      }

      if (!geminiResponse.ok) {
        const message =
          geminiData?.error?.message ||
          `Gemini API 錯誤：${geminiResponse.status}`;

        return new Response(
          JSON.stringify({
            error: message
          }),
          {
            status: geminiResponse.status,
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