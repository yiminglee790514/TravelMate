/*
 * 自動同步「航班 / 住宿 / 交通」到行程表。
 *
 * 住宿：
 * - 入住日：建立 1 筆（Check in 時間）
 * - 中間住宿日：建立 2 筆（Check out 早上 + Check in 晚上）
 * - 退房日：建立 1 筆（Check out 時間）
 * - 每一筆住宿行程都可在行程表自行修改時間。
 *
 * 航班：
 * - 去程自動帶入出發機場
 * - 回程／去程也自動帶入抵達機場
 *
 * 注意：自動同步只管理 hotel / flight / transport 產生的資料，
 * 不會覆蓋使用者自己建立或修改的普通行程。
 */

import { getCountryCode } from "./mapsCountry";
import { AIRPORTS } from "../constants/airports";

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

function getDateParts(dateString) {
  const match = String(dateString || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function nextDate(dateString) {
  const parts = getDateParts(dateString);
  if (!parts) return null;
  const date = new Date(parts.year, parts.month - 1, parts.day);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function previousDate(dateString) {
  const parts = getDateParts(dateString);
  if (!parts) return null;
  const date = new Date(parts.year, parts.month - 1, parts.day);
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getHotelTime(itineraryTimes, date, slot, fallback) {
  const value = itineraryTimes?.[date];

  if (typeof value === "string" && value.trim()) {
    // 舊版只有一個時間：保留給第一筆，第二筆使用預設時間。
    if (slot === "arrival" || slot === "morning") return value;
    return fallback;
  }

  if (value && typeof value === "object") {
    return value[slot] || value.time || fallback;
  }

  return fallback;
}

function setHotelTime(itineraryTimes, date, slot, time) {
  const current = itineraryTimes?.[date];

  if (current && typeof current === "object") {
    return {
      ...itineraryTimes,
      [date]: {
        ...current,
        [slot]: time,
      },
    };
  }

  // 舊資料若是單一字串，視為早上的既有時間；
  // 若現在修改晚上，保留原本早上的時間。
  if (typeof current === "string" && current.trim()) {
    return {
      ...itineraryTimes,
      [date]: {
        morning: current,
        [slot]: time,
      },
    };
  }

  return {
    ...itineraryTimes,
    [date]: {
      [slot]: time,
    },
  };
}

function getAirportInfo(code, name = "") {
  const normalizedCode = String(code || "").trim().toUpperCase();
  const found = AIRPORTS.find((airport) => airport.code === normalizedCode);
  if (found) return found;

  return {
    code: normalizedCode,
    name: name || normalizedCode,
    address: "",
    countryCode: "",
  };
}

function isKnownAutoItem(item) {
  return ["hotel", "flight", "transport"].includes(String(item?.autoSource || ""));
}

export function updateHotelItineraryTime(trip, groupId, stayDate, slot, time) {
  const groups = (trip?.hotelGroups || []).map((group) => {
    if (String(group.id) !== String(groupId)) return group;

    return {
      ...group,
      itineraryTimes: setHotelTime(group.itineraryTimes || {}, stayDate, slot || "arrival", time),
    };
  });

  return {
    ...trip,
    hotelGroups: groups,
  };
}

export function syncAutoItineraryItems(trip) {
  // 只移除真正由本同步器管理的資料。
  // 不再用「只要有 autoSource 就刪」的方式，避免舊資料被誤當成自動資料。
  const manualItems = (Array.isArray(trip.items) ? trip.items : []).filter(
    (item) => !isKnownAutoItem(item)
  );

  const generated = [];
  generated.__startDate = trip.startDate;

  const add = (item) => addAutoItem(generated, item);

  // =========================
  // 航班：出發 + 抵達機場都自動帶入
  // =========================
  const flightGroups = [
    ["outbound", trip.flights?.outbound],
    ["inbound", trip.flights?.inbound],
  ];

  const countryCode = getCountryCode(trip?.country || "");

  flightGroups.forEach(([flightType, value]) => {
    const flights = Array.isArray(value) ? value : value ? [value] : [];

    flights.forEach((flight) => {
      const sourceId = `${flightType}-${flight.id}`;
      const flightName = [flight.airline, flight.flightNo]
        .filter(Boolean)
        .join(" ") || "航班";

      const departureName = flight.departure?.name || flight.departure?.code || "";
      const departureAirport = getAirportInfo(flight.departure?.code, departureName);
      if (departureName) {
        add({
          id: `auto-flight-${sourceId}-departure`,
          date: flight.date,
          time: flight.departure.time,
          title: departureName,
          icon: "✈️",
          // 航班機場沒有完整地址時仍保留名稱，讓行程表可以顯示；
          // Google Maps 會由 itinerary 頁自行過濾「沒有地址」的資料。
          address: flight.departure?.address || departureAirport.address || "",
          note: `${flightName}｜${flightType === "outbound" ? "去程出發" : "回程出發"}`,
          type: "flight",
          autoSource: "flight",
          autoSourceId: sourceId,
          extra: {
            countryCode: flight.departure?.countryCode || departureAirport.countryCode || countryCode,
            airportCode: flight.departure?.code || "",
            durationMinutes: flight.departure?.durationMinutes ?? "",
            placeId: flight.departure?.placeId || "",
            placeLatitude: flight.departure?.placeLatitude ?? null,
            placeLongitude: flight.departure?.placeLongitude ?? null,
            mapsUrl: flight.departure?.mapsUrl || "",
            flightType,
            flightId: flight.id,
            flightEndpoint: "departure",
          },
        });
      }

      const arrivalName = flight.arrival?.name || flight.arrival?.code || "";
      const arrivalAirport = getAirportInfo(flight.arrival?.code, arrivalName);
      if (arrivalName) {
        add({
          id: `auto-flight-${sourceId}-arrival`,
          // 目前資料模型的航班日期是單一 date；若日後有 arrivalDate 就優先使用。
          date: flight.arrivalDate || flight.date,
          time: flight.arrival.time,
          title: arrivalName,
          icon: "🛬",
          address: flight.arrival?.address || arrivalAirport.address || "",
          note: `${flightName}｜${flightType === "outbound" ? "去程抵達" : "回程抵達"}`,
          type: "flight",
          autoSource: "flight",
          autoSourceId: sourceId,
          extra: {
            countryCode: flight.arrival?.countryCode || arrivalAirport.countryCode || countryCode,
            airportCode: flight.arrival?.code || "",
            durationMinutes: flight.arrival?.durationMinutes ?? "",
            placeId: flight.arrival?.placeId || "",
            placeLatitude: flight.arrival?.placeLatitude ?? null,
            placeLongitude: flight.arrival?.placeLongitude ?? null,
            mapsUrl: flight.arrival?.mapsUrl || "",
            flightType,
            flightId: flight.id,
            flightEndpoint: "arrival",
          },
        });
      }
    });
  });

  // =========================
  // 住宿
  // =========================
  (Array.isArray(trip.hotelGroups) ? trip.hotelGroups : []).forEach((group) => {
    const hotels = Array.isArray(group.hotels) ? group.hotels : [];
    if (hotels.length === 0) return;

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

    const startParts = getDateParts(checkIn);
    if (!startParts) return;

    const endDate = checkOut || checkIn;
    const endParts = getDateParts(endDate);
    if (!endParts) return;

    const sourceId = String(group.id);
    const itineraryTimes =
      group.itineraryTimes && typeof group.itineraryTimes === "object"
        ? group.itineraryTimes
        : {};

    const cursor = new Date(startParts.year, startParts.month - 1, startParts.day);
    const end = new Date(endParts.year, endParts.month - 1, endParts.day);

    while (cursor <= end) {
      const stayDate =
        `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;

      const day = dateToDay(trip.startDate, stayDate);

      if (day && day >= 1) {
        const isCheckInDay = stayDate === checkIn;
        const isCheckOutDay = !!checkOut && stayDate === checkOut;

        const hotelForDay =
          validHotels.find((hotel) =>
            hotel.checkIn <= stayDate &&
            (!hotel.checkOut || stayDate <= hotel.checkOut)
          ) || firstHotel;

        const checkInTime =
          hotelForDay.checkInTime ||
          firstHotel.checkInTime ||
          group.checkInTime ||
          "15:00";

        const checkOutTime =
          hotelForDay.checkOutTime ||
          firstHotel.checkOutTime ||
          group.checkOutTime ||
          "11:00";

        const title = hotelForDay.name || firstHotel.name || group.title || "住宿";
        const address = hotelForDay.address || firstHotel.address || "";

        // 10/21-10/23：
        // 10/21 晚上、10/22 早上＋晚上、10/23 早上。
        const slots = [];
        if (isCheckInDay && isCheckOutDay) {
          slots.push({ slot: "arrival", defaultTime: checkInTime, note: `入住 ${checkIn}｜退房 ${checkOut}` });
        } else if (isCheckInDay) {
          slots.push({ slot: "arrival", defaultTime: checkInTime, note: `入住 ${checkIn}${checkOut ? `｜退房 ${checkOut}` : ""}` });
        } else if (isCheckOutDay) {
          slots.push({ slot: "morning", defaultTime: checkOutTime, note: `退房 ${checkOut}` });
        } else {
          slots.push({ slot: "morning", defaultTime: checkOutTime, note: `住宿 ${checkIn}${checkOut ? `｜退房 ${checkOut}` : ""}` });
          slots.push({ slot: "evening", defaultTime: checkInTime, note: `住宿 ${checkIn}${checkOut ? `｜退房 ${checkOut}` : ""}` });
        }

        slots.forEach(({ slot, defaultTime, note }, slotIndex) => {
          const itineraryTime = getHotelTime(
            itineraryTimes,
            stayDate,
            slot,
            defaultTime
          );

          generated.push({
            id: `auto-hotel-group-${sourceId}-${stayDate}-${slot}`,
            day,
            date: stayDate,
            time: itineraryTime,
            title,
            icon: "🏨",
            address,
            note,
            type: "hotel",
            autoSource: "hotel",
            autoSourceId: sourceId,
            extra: {
              groupId: sourceId,
              hotelId: hotelForDay.id || firstHotel.id || null,
              stayDate,
              slot,
              startDate: checkIn,
              endDate: checkOut || checkIn,
              checkInDate: checkIn,
              checkOutDate: checkOut,
              checkInTime,
              checkOutTime,
              itineraryTime,
              isCheckInDay,
              isCheckOutDay,
              slotIndex,
            },
          });
        });
      }

      cursor.setDate(cursor.getDate() + 1);
    }
  });

  // =========================
  // 交通：出發 / 抵達同步，並保留行程表可編輯的停留時間與顯示文字
  // =========================
  (Array.isArray(trip.transports) ? trip.transports : []).forEach((transport) => {
    const sourceId = String(transport.id);
    // 行程表顯示完整交通名稱：例如「🚗 租車 TOYOTA Rent a Car」。
    // icon 留空，避免前面再重複顯示一次 🚗。
    const title = [transport.type, transport.company].filter(Boolean).join(" ") || "🚆 交通";
    const icon = "";

    if (transport.departureDate) {
      add({
        id: `auto-transport-${sourceId}-departure`,
        date: transport.departureDate,
        time: transport.departureTime || "00:00",
        title, icon, address: transport.from || "",
        // 行程表備註與交通資料中的備註完全同步，保留原本換行。
        note: transport.note || "",
        durationMinutes: transport.departureDurationMinutes ?? "",
        type: "transport", autoSource: "transport", autoSourceId: sourceId,
        extra: { transportId: sourceId, transportEndpoint: "departure", eventLabel: transport.departureLabel || "出發", countryCode: transport.fromMeta?.countryCode || "", placeId: transport.fromMeta?.placeId || "", placeLatitude: transport.fromMeta?.placeLatitude ?? null, placeLongitude: transport.fromMeta?.placeLongitude ?? null, mapsUrl: transport.fromMeta?.mapsUrl || "" },
      });
    }
    if (transport.arrivalDate && (transport.arrivalDate !== transport.departureDate || transport.arrivalTime)) {
      add({
        id: `auto-transport-${sourceId}-arrival`,
        date: transport.arrivalDate,
        time: transport.arrivalTime || "00:00",
        title, icon, address: transport.to || "",
        note: transport.note || "",
        durationMinutes: transport.arrivalDurationMinutes ?? "",
        type: "transport", autoSource: "transport", autoSourceId: sourceId,
        extra: { transportId: sourceId, transportEndpoint: "arrival", eventLabel: transport.arrivalLabel || "抵達", countryCode: transport.toMeta?.countryCode || "", placeId: transport.toMeta?.placeId || "", placeLatitude: transport.toMeta?.placeLatitude ?? null, placeLongitude: transport.toMeta?.placeLongitude ?? null, mapsUrl: transport.toMeta?.mapsUrl || "" },
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
