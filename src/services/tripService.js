const STORAGE_KEY = "travelmate-trips";

/**
 * 取得所有旅程
 */
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

/**
 * 儲存所有旅程
 */
function saveTrips(trips) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

/**
 * 新增旅程
 */
function addTrip(trip) {
  const trips = getTrips();

  trips.push(trip);

  saveTrips(trips);

  return trip;
}

/**
 * 依 ID 取得旅程
 */
function getTrip(id) {
  return getTrips().find(
    (trip) => String(trip.id) === String(id)
  );
}

/**
 * 更新旅程
 */
function updateTrip(updatedTrip) {
  const trips = getTrips();

  const index = trips.findIndex(
    (trip) => String(trip.id) === String(updatedTrip.id)
  );

  if (index === -1) return;

  trips[index] = updatedTrip;

  saveTrips(trips);
}

/**
 * 刪除旅程
 */
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

  return trip.items || [];
}

function addItem(tripId, item) {
  const trip = getTrip(tripId);

  if (!trip) return;

  if (!trip.items) {
    trip.items = [];
  }

  trip.items.push(item);

  updateTrip(trip);
}

function updateItem(tripId, updatedItem) {
  const trip = getTrip(tripId);

  if (!trip || !trip.items) return;

  const index = trip.items.findIndex(
    (item) => item.id === updatedItem.id
  );

  if (index === -1) return;

  trip.items[index] = updatedItem;

  updateTrip(trip);
}

function deleteItem(tripId, itemId) {
  const trip = getTrip(tripId);

  if (!trip || !trip.items) return;

  trip.items = trip.items.filter(
    (item) => item.id !== itemId
  );

  updateTrip(trip);
}

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
};

export default tripService;