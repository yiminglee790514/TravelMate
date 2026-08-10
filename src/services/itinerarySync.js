/*
 * 自動同步「航班 / 住宿 / 交通」到行程表。
 *
 * 規則：
 * - 航班：每一航段只同步「出發機場」一筆，避免去程/抵達造成重複。
 * - 住宿：每一間住宿只同步「入住」一筆，避免入住/退房造成重複。
 * - 交通：維持出發 / 抵達同步。
 * - 手動建立的行程不會被碰到。
 */

function dateToDay(startDate, date) {
  if (!startDate || !date) return null;

  const start = new Date(`${startDate}T00:00:00`);
  const target = new Date(`${date}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(target.getTime())) {
    return null;
  }

  return Math.floor((target - start) / 86400000) + 1;
}

function addAutoItem(list, item) {
  if (!item.date || !item.title) return;

  const day = dateToDay(list.__startDate, item.date);
  if (!day || day < 1) return;

  list.push({
    id: item.id,
    day,
    time: item.time || "00:00",
    title: item.title,
    icon: item.icon,
    address: item.address || "",
    note: item.note || "",
    type: item.type,
    autoSource: item.autoSource,
    autoSourceId: item.autoSourceId,
    extra: item.extra || {},
  });
}

export function syncAutoItineraryItems(trip) {
  const manualItems = (Array.isArray(trip.items) ? trip.items : []).filter(
    (item) => !item.autoSource
  );

  const generated = [];
  generated.__startDate = trip.startDate;

  const add = (item) => addAutoItem(generated, item);

  // =========================
  // 航班：每個航段只取出發機場
  // 例如：小港 → 熊本，只建立「小港機場」一筆
  // =========================
  const flightGroups = [
    ["outbound", trip.flights?.outbound],
    ["inbound", trip.flights?.inbound],
  ];

  flightGroups.forEach(([flightType, value]) => {
    const flights = Array.isArray(value) ? value : value ? [value] : [];

    flights.forEach((flight) => {
      const sourceId = `${flightType}-${flight.id}`;
      const flightName = [flight.airline, flight.flightNo]
        .filter(Boolean)
        .join(" ") || "航班";

      if (flight.departure?.name || flight.departure?.code) {
        add({
          id: `auto-flight-${sourceId}-departure`,
          date: flight.date,
          time: flight.departure.time,
          title: flight.departure.name || flight.departure.code,
          icon: "✈️",
          address: flight.departure.name || "",
          note: `${flightName}｜${flightType === "outbound" ? "去程出發" : "回程出發"}`,
          type: "flight",
          autoSource: "flight",
          autoSourceId: sourceId,
        });
      }
    });
  });

  // =========================
  // 住宿：每一間住宿只取「入住」一筆
  // =========================
  // 同一天只建立一筆「入住」資料。
  // 例如住宿資料裡有兩筆相同入住日期，只保留第一筆，
  // 避免同一天在行程表出現兩次住宿。
  const hotelCheckInDates = new Set();

  (Array.isArray(trip.hotelGroups) ? trip.hotelGroups : []).forEach((group) => {
    (Array.isArray(group.hotels) ? group.hotels : []).forEach((hotel) => {
      const title = hotel.name || group.title || "住宿";
      const sourceId = String(hotel.id);
      const date = hotel.checkIn;

      if (!date || hotelCheckInDates.has(date)) return;

      hotelCheckInDates.add(date);

      add({
        id: `auto-hotel-${date}-checkin`,
        date,
        time: hotel.checkInTime || "15:00",
        title,
        icon: "🏨",
        address: hotel.address || "",
        note: "入住",
        type: "hotel",
        autoSource: "hotel",
        autoSourceId: sourceId,
      });
    });
  });

  // =========================
  // 交通：維持出發 / 抵達同步
  // =========================
  (Array.isArray(trip.transports) ? trip.transports : []).forEach((transport) => {
    const sourceId = String(transport.id);
    const title = transport.company || transport.type || "交通";

    if (transport.departureDate) {
      add({
        id: `auto-transport-${sourceId}-departure`,
        date: transport.departureDate,
        time: transport.departureTime || "00:00",
        title,
        icon: "🚆",
        address: transport.from || "",
        note: transport.to ? `出發 → ${transport.to}` : "出發",
        type: "transport",
        autoSource: "transport",
        autoSourceId: sourceId,
      });
    }

    if (
      transport.arrivalDate &&
      (transport.arrivalDate !== transport.departureDate || transport.arrivalTime)
    ) {
      add({
        id: `auto-transport-${sourceId}-arrival`,
        date: transport.arrivalDate,
        time: transport.arrivalTime || "00:00",
        title,
        icon: "🚆",
        address: transport.to || "",
        note: transport.from ? `抵達 ← ${transport.from}` : "抵達",
        type: "transport",
        autoSource: "transport",
        autoSourceId: sourceId,
      });
    }
  });

  delete generated.__startDate;

  return [...manualItems, ...generated].sort((a, b) => {
    const dayA = Number(a.day || 0);
    const dayB = Number(b.day || 0);
    if (dayA !== dayB) return dayA - dayB;
    return String(a.time || "").localeCompare(String(b.time || ""));
  });
}
