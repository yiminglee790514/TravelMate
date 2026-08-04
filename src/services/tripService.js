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
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(trips)
  );
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
    trip => String(trip.id) === String(id)
  );
}

/**
 * 更新旅程
 */
function updateTrip(updatedTrip) {

  const trips = getTrips();

  const index = trips.findIndex(
    trip => String(trip.id) === String(updatedTrip.id)
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
    trip => String(trip.id) !== String(id)
  );

  saveTrips(trips);
}

const tripService = {
  getTrips,
  getTrip,
  addTrip,
  updateTrip,
  deleteTrip,
  saveTrips,
};

export default tripService;