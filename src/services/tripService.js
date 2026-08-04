import { syncLocalToCloud } from "./cloudService";

const STORAGE_KEY = "travelmate-trips";

/* ===========================
   Trip
=========================== */

function getTrips() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("讀取旅程失敗：", error);
    return [];
  }
}

function saveTrips(trips) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(trips)
  );

  // 同步到 Firebase（非同步執行，不影響原本流程）
  syncLocalToCloud(trips)
    .catch(console.error);

}

function addTrip(trip) {
  const trips = getTrips();

  trips.push(trip);

  saveTrips(trips);

  return trip;
}

function getTrip(id) {

  const trip = getTrips().find(
    (trip) => String(trip.id) === String(id)
  );

  if (!trip) return null;

  /* ===== 相容舊資料 ===== */

  if (!trip.items) {
    trip.items = [];
  }

  if (!trip.flights) {
    trip.flights = {
      outbound: null,
      inbound: null,
    };
  }

  if (!trip.hotels) {
    trip.hotels = [];
  }

  if (!trip.transports) {
    trip.transports = [];
  }

  if (!trip.expenses) {
    trip.expenses = [];
  }

  if (!trip.tickets) {
    trip.tickets = [];
  }

  return trip;
}

function updateTrip(updatedTrip) {

  const trips = getTrips();

  console.log("更新前：", trips);

  const index = trips.findIndex(
    (trip) => String(trip.id) === String(updatedTrip.id)
  );

  console.log("index =", index);
  console.log("updatedTrip =", updatedTrip);

  if (index === -1) return;

  trips[index] = updatedTrip;

  saveTrips(trips);
}

function deleteTrip(id) {

  const trips = getTrips().filter(
    (trip) => String(trip.id) !== String(id)
  );

  saveTrips(trips);
}

/* ===========================
   Item
=========================== */

function getItems(tripId) {

  const trip = getTrip(tripId);

  if (!trip) return [];

  return trip.items;
}

function addItem(tripId, item) {

  const trip = getTrip(tripId);

  if (!trip) return;

  trip.items.push(item);

  updateTrip(trip);
}

function updateItem(tripId, updatedItem) {

  const trip = getTrip(tripId);

  if (!trip) return;

  const index = trip.items.findIndex(
    (item) => item.id === updatedItem.id
  );

  if (index === -1) return;

  trip.items[index] = updatedItem;

  updateTrip(trip);
}

function deleteItem(tripId, itemId) {

  const trip = getTrip(tripId);

  if (!trip) return;

  trip.items = trip.items.filter(
    (item) => item.id !== itemId
  );

  updateTrip(trip);
}

/* ===========================
   Flight
=========================== */

function getFlights(tripId) {

  const trip = getTrip(tripId);

  if (!trip) return {
    outbound: null,
    inbound: null,
  };

  return trip.flights;
}

function saveFlights(tripId, flights) {

  const trip = getTrip(tripId);

  if (!trip) return;

  trip.flights = flights;

  updateTrip(trip);
}

/* ===========================
   Export
=========================== */

const tripService = {

  getTrips,
  getTrip,
  addTrip,
  updateTrip,
  deleteTrip,

  getItems,
  addItem,
  updateItem,
  deleteItem,

  getFlights,
  saveFlights,

};

export default tripService;