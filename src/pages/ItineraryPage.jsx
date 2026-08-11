import TimelineItem from "../components/day/TimelineItem";
import TravelTimeConnector from "../components/day/TravelTimeConnector";
import AddItemModal from "../components/day/AddItemModal";

import { useState, useEffect, useRef } from "react";
import { generateAIPlan } from "../services/aiPlannerService";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";
import { syncAutoItineraryItems } from "../services/itinerarySync";
import { getGoogleMapsDayItems, openGoogleMapsDayRoute } from "../services/mapsService";

import {
  canEdit,
  isOwner,
} from "../services/permissionService";
import DaySelector from "../components/trip/DaySelector";




function getDays(startDate, endDate) {

  if (!startDate || !endDate) return [];

  const result = [];

  const current = new Date(startDate);

  const end = new Date(endDate);

  let day = 1;

  while (current <= end) {

    result.push({

      day,

      date: current.toISOString().split("T")[0],

    });

    current.setDate(current.getDate() + 1);

    day++;

  }

  return result;

}

export default function TripDetail() {

  const { id, shareId } = useParams();

  const navigate = useNavigate();

  const {

    trip: cloudTrip,

    updateTrip,

  } = useTrip(id);

  const owner = cloudTrip
    ? isOwner(cloudTrip)
    : false;

  const editable = cloudTrip
    ? canEdit(cloudTrip)
    : false;

  // 分享頁一定唯讀
  // 一般旅程等待 cloudTrip 載入後再判斷
  const readonly = shareId
    ? true
    : (cloudTrip ? !editable : false);

  const [openDay, setOpenDay] = useState(0);

  const [showModal, setShowModal] = useState(false);

  const [editItem, setEditItem] = useState(null);

  const [currentDay, setCurrentDay] = useState(1);

  // AI 規劃第一版
  const [showAIPlanner, setShowAIPlanner] = useState(false);
  const [aiDate, setAiDate] = useState("");
  const [aiStartTime, setAiStartTime] = useState("09:00");
  const [aiEndTime, setAiEndTime] = useState("21:00");
  const [aiTransport, setAiTransport] = useState("不限／混合");
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiAddedIds, setAiAddedIds] = useState([]);
  const [aiAddError, setAiAddError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const [trip, setTrip] = useState(null);

  const [items, setItems] = useState([]);
  const [routeResults, setRouteResults] = useState({});

  const initialized = useRef(false);

  const days = trip
  ? getDays(trip.startDate, trip.endDate)
  : [];

  useEffect(() => {
    
    async function loadTrip() {

      // 分享模式
      if (shareId) {

        const data = await getShare(shareId);

        if (!data) return;

        if (!data.items) {

          data.items = [];

        }

        setTrip(data);

        setItems(data.items);

        return;

      }

      // 一般旅程
      if (!cloudTrip) return;

      // 重新整理自動連動資料，讓舊版重複的飯店資料也能自動修正。
      // 同一住宿群組只保留 1 筆 auto item，跨住宿日期時由畫面重複顯示。
      const t = {

        ...cloudTrip,

      };

      const syncedItems =
        syncAutoItineraryItems(t);

      t.items = syncedItems;

      setTrip(t);
      setItems(syncedItems);

      const oldItems = Array.isArray(cloudTrip.items)
        ? cloudTrip.items
        : [];

      // 把雲端舊版重複資料整理掉。
      if (JSON.stringify(oldItems) !== JSON.stringify(syncedItems)) {
        try {
          await updateTrip(t);
        } catch (error) {
          console.error("同步行程表失敗", error);
        }
      }

    }

    loadTrip();

  }, [cloudTrip, shareId]);

useEffect(() => {

  if (!trip || days.length === 0) return;

  // 已經初始化過就不要再自動展開
  if (initialized.current) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let targetDay = days[0].day;

  for (const d of days) {

    const date = new Date(d.date);

    if (date >= today) {

      targetDay = d.day;
      break;

    }

    targetDay = d.day;

  }

  setOpenDay(targetDay);

  initialized.current = true;

}, [trip, days, initialized]);

  function openAIPlanner() {
    const defaultDate = trip?.startDate || days[0]?.date || "";
    setAiDate(defaultDate);
    setAiStartTime("09:00");
    setAiEndTime("21:00");
    setAiTransport("不限／混合");
    setAiError("");
    setAiCopied(false);
    setAiAddedIds([]);
    setAiAddError("");
    setShowAIPlanner(true);
  }

  useEffect(() => {
    if (shareId || !trip || searchParams.get("ai") !== "1") return;
    openAIPlanner();
    setSearchParams({}, { replace: true });
  }, [trip, shareId, searchParams, setSearchParams]);

  const aiDay = days.find((d) => d.date === aiDate);
  const aiDayItems = aiDay
    ? items
        .filter((item) => (item.day ?? 1) === aiDay.day)
        .sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")))
    : [];

  function getAIItemType(item) {
    const raw = String(item?.type || item?.category || "").toLowerCase();

    if (raw.includes("hotel") || raw.includes("lodging") || raw.includes("住宿")) return "hotel";
    if (raw.includes("restaurant") || raw.includes("food") || raw.includes("餐") || raw.includes("咖啡")) return "restaurant";
    if (raw.includes("shopping") || raw.includes("shop") || raw.includes("購物")) return "shopping";
    if (raw.includes("transport") || raw.includes("交通")) return "transport";
    if (raw.includes("flight") || raw.includes("airport") || raw.includes("航班")) return "flight";
    return "attraction";
  }

  function getAIItemIcon(type) {
    const iconMap = {
      flight: "✈️",
      hotel: "🏨",
      restaurant: "🍜",
      attraction: "📍",
      shopping: "🛍️",
      transport: "🚆",
    };
    return iconMap[type] || "📍";
  }

  function buildAITripItem(recommendation, index) {
    const type = getAIItemType(recommendation);
    const title = String(recommendation?.title || "").trim();
    const time = String(recommendation?.time || "").trim();
    const address = String(recommendation?.address || recommendation?.location || "").trim();
    const reason = String(recommendation?.reason || "").trim();
    const detailParts = [];

    if (recommendation?.duration) detailParts.push(`建議停留：${recommendation.duration}`);
    if (recommendation?.travelTime) detailParts.push(`交通：約 ${recommendation.travelTime}`);
    if (reason) detailParts.push(`AI 建議：${reason}`);

    return {
      id: (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `ai-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      day: aiDay?.day || 1,
      time,
      title: title || "AI 建議行程",
      address,
      note: detailParts.join("｜"),
      type,
      icon: getAIItemIcon(type),
      source: "ai",
      aiGenerated: true,
      extra: {
        aiReason: reason,
        duration: recommendation?.duration || "",
        travelTime: recommendation?.travelTime || "",
        aiLocation: recommendation?.location || "",
      },
    };
  }

  async function addAIRecommendations(recommendations) {
    if (!Array.isArray(recommendations) || recommendations.length === 0) return;

    setAiAddError("");

    const validRecommendations = recommendations.filter((item) =>
      String(item?.time || "").trim() && String(item?.title || "").trim()
    );

    if (validRecommendations.length === 0) {
      setAiAddError("AI 沒有產生可以加入的有效行程。");
      return;
    }

    const currentAddedKeys = new Set(aiAddedIds);
    const toAdd = validRecommendations.filter((item) => {
      const key = `${item.time || ""}|${item.title || ""}`;
      return !currentAddedKeys.has(key);
    });

    if (toAdd.length === 0) {
      return;
    }

    const newItems = toAdd.map((item, index) => buildAITripItem(item, index));
    const updatedItems = [...items, ...newItems].sort((a, b) => {
      if ((a.day ?? 1) !== (b.day ?? 1)) return (a.day ?? 1) - (b.day ?? 1);
      return String(a.time || "").localeCompare(String(b.time || ""));
    });

    try {
      await updateTrip({
        ...trip,
        items: updatedItems,
      });

      setItems(updatedItems);
      setAiAddedIds((prev) => [
        ...prev,
        ...toAdd.map((item) => `${item.time || ""}|${item.title || ""}`),
      ]);
    } catch (error) {
      console.error("加入 AI 行程失敗", error);
      setAiAddError(error?.message || "加入行程失敗，請稍後再試。");
    }
  }

  async function handleAddAIItem(recommendation) {
    await addAIRecommendations([recommendation]);
  }

  async function handleAddAllAIItems() {
    await addAIRecommendations(aiResult?.recommendations || []);
  }

  async function handleGeminiPlan() {
    if (!aiDate || !aiDay) {
      setAiError("請先選擇日期。");
      return;
    }

    if (aiStartTime >= aiEndTime) {
      setAiError("開始時間必須早於結束時間。");
      return;
    }

    setAiError("");
    setAiResult(null);
    setAiAddedIds([]);
    setAiAddError("");
    setAiLoading(true);

    try {
      const result = await generateAIPlan({
        trip,
        date: aiDate,
        day: aiDay.day,
        startTime: aiStartTime,
        endTime: aiEndTime,
        transport: aiTransport,
        existingItems: aiDayItems,
      });
      setAiResult(result);
    } catch (error) {
      console.error(error);
      setAiError(error?.message || "Gemini AI 規劃失敗，請檢查 API Key 與網路連線。");
    } finally {
      setAiLoading(false);
    }
  }

  if (!trip) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <h1 className="text-3xl font-bold">

          載入中...

        </h1>

      </div>

    );

  }

  const activeDay = days.find((day) => day.day === openDay) || days[0];
  const activeDayItems = activeDay
    ? items
        .filter((timelineItem) => (timelineItem.day ?? 1) === activeDay.day)
        .sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")))
    : [];

  function handleOpenLinkedItem(timelineItem) {
    const base = shareId ? `/share/${shareId}` : `/trip/${id}`;
    if (timelineItem.type === "hotel") navigate(`${base}/hotel`);
    if (timelineItem.type === "flight") navigate(`${base}/flight`);
    if (timelineItem.type === "transport") navigate(`${base}/transport`);
  }

  const googleMapsItems = getGoogleMapsDayItems(
    activeDayItems,
    trip?.country || ""
  );

  function handleOpenGoogleMaps() {
    try {
      openGoogleMapsDayRoute(activeDayItems, {
        country: trip?.country || "",
      });
    } catch (error) {
      alert(error?.message || "無法建立 Google Maps 路線");
    }
  }

  return (
    <>
      <div className="tm-itinerary-page">
        <DaySelector
          days={days}
          activeDay={activeDay?.day || 1}
          onChange={(day) => setOpenDay(day)}
        />

        {activeDay && (
          <section className="tm-itinerary-card">
            <div className="tm-itinerary-card-header">
              <div className="flex min-w-0 items-center gap-2">
                <span className="tm-day-dot" />
                <div className="min-w-0">
                  <h2 className="tm-itinerary-day-title">
                    Day {activeDay.day}
                  </h2>
                  <p className="tm-itinerary-day-date">
                    {(() => {
                      const date = new Date(`${activeDay.date}T00:00:00`);
                      const week = ["日", "一", "二", "三", "四", "五", "六"];
                      return `${date.getMonth() + 1}/${date.getDate()}（週${week[date.getDay()]}）`;
                    })()}
                  </p>
                </div>
              </div>
              <div className="tm-itinerary-header-actions">
                <button
                  type="button"
                  className="tm-google-maps-button"
                  onClick={handleOpenGoogleMaps}
                  disabled={googleMapsItems.length < 2}
                  title="只使用這一天、符合旅遊國家且有地址的行程開啟 Google Maps"
                >
                  <span aria-hidden="true">🗺️</span>
                  <span>Google Maps</span>
                </button>

                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const date = new Date(`${activeDay.date}T00:00:00`);
                  return today.getTime() === date.getTime() ? (
                    <span className="tm-today-badge">今天</span>
                  ) : null;
                })()}
              </div>
            </div>

            <div className="tm-timeline">
              {activeDayItems.length === 0 ? (
                <div className="tm-empty-day">
                  <div className="text-2xl">🗓️</div>
                  <div className="mt-2 font-semibold text-slate-700">這一天還沒有行程</div>
                  {!readonly && <div className="mt-1 text-xs text-slate-400">從下面新增第一個行程吧</div>}
                </div>
              ) : (
                activeDayItems.map((timelineItem, index) => {
                  const previousItem = activeDayItems[index - 1];
                  const routeKey = previousItem && timelineItem
                    ? `${previousItem.id}-${timelineItem.id}`
                    : "";

                  return (
                    <div key={timelineItem.id}>
                      {previousItem && routeKey && (
                        <TravelTimeConnector
                          from={previousItem}
                          to={timelineItem}
                          trip={trip}
                          date={activeDay.date}
                          initialMode={routeResults[routeKey]?.mode || "DRIVE"}
                          initialResult={routeResults[routeKey] || null}
                          onResult={(result) => {
                            setRouteResults((prev) => ({
                              ...prev,
                              [routeKey]: result,
                            }));
                          }}
                        />
                      )}

                      <TimelineItem
                        item={timelineItem}
                        readonly={readonly || !!timelineItem.autoSource}
                        owner={owner}
                        onClick={
                          ["hotel", "flight", "transport"].includes(timelineItem.type)
                            ? () => handleOpenLinkedItem(timelineItem)
                            : undefined
                        }
                        onEdit={() => {
                          setEditItem(timelineItem);
                          setCurrentDay(activeDay.day);
                          setShowModal(true);
                        }}
                        onDelete={async () => {
                          if (!owner) return;
                          const updatedItems = items.filter((i) => i.id !== timelineItem.id);
                          await updateTrip({ ...trip, items: updatedItems });
                          setItems(updatedItems);
                          setRouteResults((prev) => {
                            const next = { ...prev };
                            Object.keys(next).forEach((key) => {
                              if (key.includes(String(timelineItem.id))) delete next[key];
                            });
                            return next;
                          });
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {!readonly && (
              <button
                type="button"
                onClick={() => {
                  setEditItem(null);
                  setCurrentDay(activeDay.day);
                  setShowModal(true);
                }}
                className="tm-add-day-button"
              >
                ＋ 新增此日行程
              </button>
            )}
          </section>
        )}
      </div>

      {!readonly && showAIPlanner && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold">🤖 AI 規劃行程</h2>
                <p className="mt-1 text-sm text-gray-500">使用 Gemini AI 讀取這一天的行程並提出建議。</p>
              </div>
              <button type="button" onClick={() => setShowAIPlanner(false)} className="rounded-full px-3 py-1 text-2xl text-gray-400 hover:bg-gray-100">×</button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">📅 日期</label>
                <select value={aiDate} onChange={(e) => { setAiDate(e.target.value); setAiResult(null); }} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500">
                  {days.map((d) => {
                    const date = new Date(`${d.date}T00:00:00`);
                    const week = ["日", "一", "二", "三", "四", "五", "六"];
                    return <option key={d.date} value={d.date}>Day {d.day}　{date.getMonth() + 1}/{date.getDate()}（週{week[date.getDay()]}）</option>;
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">🕘 開始時間</label>
                  <input type="time" value={aiStartTime} onChange={(e) => { setAiStartTime(e.target.value); setAiResult(null); }} className="box-border min-w-0 w-full max-w-full rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-blue-500" />
                </div>
                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">🕘 結束時間</label>
                  <input type="time" value={aiEndTime} onChange={(e) => { setAiEndTime(e.target.value); setAiResult(null); }} className="box-border min-w-0 w-full max-w-full rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">🚗 交通方式</label>
                <select value={aiTransport} onChange={(e) => { setAiTransport(e.target.value); setAiResult(null); }} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500">
                  <option>不限／混合</option>
                  <option>🚗 自駕／租車</option>
                  <option>🚆 大眾運輸</option>
                  <option>🚕 計程車</option>
                  <option>🚶 步行</option>
                </select>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-bold">📋 目前這一天的行程</div>
                  <span className="text-sm text-gray-500">{aiDayItems.length} 筆</span>
                </div>
                {aiDayItems.length === 0 ? (
                  <div className="rounded-xl bg-white px-4 py-5 text-center text-sm text-gray-500">這一天目前沒有行程，Gemini 可以從空白開始規劃。</div>
                ) : (
                  <div className="space-y-2">
                    {aiDayItems.map((item) => (
                      <div key={item.id} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span>{item.icon || "📍"}</span>
                          <span className="font-semibold">{item.time || "--:--"}</span>
                          <span>{item.title || item.name || "未命名行程"}</span>
                        </div>
                        {item.address && <div className="mt-1 pl-7 text-xs text-gray-500">{item.address}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {aiError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <div className="font-bold">❌ Gemini 規劃失敗</div>
                  <div className="mt-1 break-words">{aiError}</div>
                </div>
              )}

              {aiResult && (
                <div className="space-y-4 rounded-2xl border border-violet-100 bg-violet-50 p-4">
                  <div>
                    <div className="font-bold text-violet-900">{aiResult.summary || "Gemini 規劃完成"}</div>
                    {aiResult.pace && <div className="mt-1 text-sm text-violet-700">節奏：{aiResult.pace}</div>}
                  </div>

                  {Array.isArray(aiResult.recommendations) && aiResult.recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {aiResult.recommendations.map((item, index) => {
                        const addKey = `${item.time || ""}|${item.title || ""}`;
                        const alreadyAdded = aiAddedIds.includes(addKey);

                        return (
                          <div key={`${item.time}-${item.title}-${index}`} className="rounded-2xl bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1 font-bold text-gray-900">{item.time || "--:--"}　{item.title || "建議行程"}</div>
                              <span className="shrink-0 text-lg">{item.icon || "📍"}</span>
                            </div>
                            {item.location && <div className="mt-1 break-words text-sm text-gray-700">📍 {item.location}</div>}
                            {item.duration && <div className="mt-1 text-sm text-gray-600">⏱️ 停留 {item.duration}</div>}
                            {item.travelTime && <div className="mt-1 text-sm text-gray-600">🚗 交通約 {item.travelTime}</div>}
                            {item.reason && <div className="mt-2 text-sm leading-6 text-gray-600">{item.reason}</div>}

                            <button
                              type="button"
                              disabled={alreadyAdded}
                              onClick={() => handleAddAIItem(item)}
                              className={`mt-4 w-full rounded-xl py-2.5 text-sm font-bold transition ${
                                alreadyAdded
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.99]"
                              }`}
                            >
                              {alreadyAdded ? "✓ 已加入行程" : "＋ 加入這筆行程"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-white p-4 text-sm text-gray-600">Gemini 判斷這段時間不適合再增加行程。</div>
                  )}

                  {aiResult.warning && (
                    <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">⚠️ {aiResult.warning}</div>
                  )}

                  {aiAddError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      ❌ {aiAddError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddAllAIItems}
                    disabled={!aiResult.recommendations?.length || aiResult.recommendations.every((item) => aiAddedIds.includes(`${item.time || ""}|${item.title || ""}`))}
                    className="w-full rounded-2xl bg-green-600 py-3.5 font-bold text-white shadow-md transition hover:bg-green-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-green-100 disabled:text-green-700"
                  >
                    {aiResult.recommendations?.length && aiResult.recommendations.every((item) => aiAddedIds.includes(`${item.time || ""}|${item.title || ""}`))
                      ? "✓ 已全部加入行程"
                      : `＋ 一次加入 ${aiResult.recommendations?.length || 0} 筆行程`}
                  </button>

                  <div className="text-xs leading-5 text-violet-700">加入後會直接寫入這一天的 TravelMate 行程表；你仍然可以再自行修改或刪除。</div>
                </div>
              )}

              <button
                type="button"
                disabled={aiLoading}
                onClick={handleGeminiPlan}
                className="w-full rounded-2xl bg-violet-600 py-4 font-bold text-white shadow-md transition hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {aiLoading ? "🤖 Gemini 正在規劃…" : "🤖 開始 Gemini AI 規劃"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!readonly && showModal && (

        <AddItemModal
          day={currentDay}
          item={editItem}
          trip={trip}
          onClose={() => {

            setEditItem(null);

            setShowModal(false);

          }}
          onSave={async (item) => {

            const iconMap = {

              flight: "✈️",

              hotel: "🏨",

              restaurant: "🍜",

              attraction: "📍",

              shopping: "🛍️",

              transport: "🚆",

            };

            const newItem = {

              ...item,

              icon: iconMap[item.type] || "📍",

            };

            let updatedItems;

            if (editItem) {

              updatedItems = items.map((i) =>

                i.id === newItem.id
                  ? newItem
                  : i

              );

            } else {

              updatedItems = [

                ...items,

                newItem,

              ];

            }

            await updateTrip({

              ...trip,

              items: updatedItems,

            });

            setItems(updatedItems);

            setEditItem(null);

            setShowModal(false);

          }}
        />

      )}

    </>

  );

}