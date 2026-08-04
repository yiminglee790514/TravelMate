/**
 * 依 ID 取得旅程
 */
function getTrip(id) {

  const trip = getTrips().find(
    (trip) => String(trip.id) === String(id)
  );

  if (!trip) return null;

  // ===== 相容舊版本資料 =====

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