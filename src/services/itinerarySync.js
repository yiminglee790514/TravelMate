/*
 * 自動同步「航班 / 住宿 / 交通」到行程表。
 *
 * 住宿規則：
 * - 每間飯店只建立一筆自動行程資料。
 * - 住宿期間的每一天都顯示這一筆飯店資料。
 * - 例如入住 10/21、退房 10/23（住兩晚），行程表 10/21、10/22
 *   都會顯示飯店；10/23 不顯示住宿。
 * - 同一天同一間飯店不會建立多筆資料。
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

function subtractOneDay(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
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
  // 住宿：依「住宿晚數」產生行程表資料。
  //
  // 重要規則：
  // 1. 入住日算住宿，退房日不算住宿。
  // 2. 例如 10/21 → 10/22 = 1 晚，只顯示 10/21。
  // 3. 例如 10/21 → 10/23 = 2 晚，顯示 10/21、10/22。
  // 4. 同一住宿群組同一天，就算裡面有 2 筆以上住宿資料，
  //    行程表也只產生 1 筆。
  // 5. 行程表標題使用「飯店名稱」，不再使用住宿群組名稱。
  //    避免舊資料 / Firebase 序列化後造成飯店不顯示。
  // =========================
  (Array.isArray(trip.hotelGroups) ? trip.hotelGroups : []).forEach((group) => {
    const hotels = Array.isArray(group.hotels) ? group.hotels : [];
    if (hotels.length === 0) return;

    // 群組日期優先；舊資料沒有群組日期時，從飯店資料反推。
    const validHotels = hotels.filter((hotel) => hotel && hotel.checkIn);
    const firstHotel = validHotels[0] || hotels[0] || {};

    const checkIn =
      group.checkIn ||
      firstHotel.checkIn ||
      validHotels.map((h) => h.checkIn).sort()[0] ||
      "";

    const checkOut =
      group.checkOut ||
      firstHotel.checkOut ||
      validHotels
        .map((h) => h.checkOut)
        .filter(Boolean)
        .sort()
        .slice(-1)[0] ||
      "";

    if (!checkIn) return;

    const start = new Date(`${checkIn}T00:00:00`);
    if (Number.isNaN(start.getTime())) return;

    // 沒有退房日就只顯示入住當天。
    const endExclusive = checkOut
      ? new Date(`${checkOut}T00:00:00`)
      : new Date(start);

    if (Number.isNaN(endExclusive.getTime()) || endExclusive < start) return;

    const sourceId = String(group.id);
    const title = hotelForDay.name || firstHotel.name || group.title || "住宿";

    // 用日期字串遞增，避免 toISOString() 因時區造成前一天 / 後一天問題。
    const cursor = new Date(start);
    const end = new Date(endExclusive);

    while (cursor < end || (!checkOut && cursor.getTime() === start.getTime())) {
      const yyyy = cursor.getFullYear();
      const mm = String(cursor.getMonth() + 1).padStart(2, "0");
      const dd = String(cursor.getDate()).padStart(2, "0");
      const stayDate = `${yyyy}-${mm}-${dd}`;

      const day = dateToDay(trip.startDate, stayDate);
      if (day && day >= 1) {
        // 同一天同一住宿群組只取一筆住宿資料。
        // 如果有多筆房間 / 訂房人資料，行程表仍只顯示一次飯店。
        const hotelForDay =
          validHotels.find((hotel) =>
            hotel.checkIn <= stayDate &&
            (!hotel.checkOut || stayDate < hotel.checkOut)
          ) || firstHotel;

        generated.push({
          id: `auto-hotel-group-${sourceId}-${stayDate}`,
          day,
          date: stayDate,
          time: hotelForDay.checkInTime || firstHotel.checkInTime || "15:00",
          title,
          icon: "🏨",
          address: hotelForDay.address || firstHotel.address || "",
          note: `入住 ${checkIn}${checkOut ? `｜退房 ${checkOut}` : ""}`,
          type: "hotel",
          autoSource: "hotel",
          autoSourceId: sourceId,
          extra: {
            groupId: sourceId,
            hotelId: hotelForDay.id || firstHotel.id || null,
            stayDate,
            startDate: checkIn,
            endDate: checkOut || checkIn,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            checkInTime: hotelForDay.checkInTime || firstHotel.checkInTime || "15:00",
            checkOutTime: hotelForDay.checkOutTime || firstHotel.checkOutTime || "11:00",
          },
        });
      }

      if (!checkOut) break;
      cursor.setDate(cursor.getDate() + 1);
    }
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
