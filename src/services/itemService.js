import tripService from "./tripService";

function addItem(tripId, day, item) {

  const trip = tripService.getTrip(tripId);

  if (!trip) return;

  // 第一次建立 days
  if (!trip.days) {
    trip.days = [];
  }

  // 找 Day
  let dayData = trip.days.find(d => d.day === day);

  if (!dayData) {

    dayData = {
      id: Date.now(),
      day,
      items: []
    };

    trip.days.push(dayData);
  }

  dayData.items.push(item);

  tripService.updateTrip(trip);
}

function getItems(tripId, day) {

  const trip = tripService.getTrip(tripId);

  if (!trip || !trip.days) {
    return [];
  }

  const dayData = trip.days.find(d => d.day === day);

  if (!dayData) {
    return [];
  }

  return dayData.items;
}

const itemService = {
  addItem,
  getItems,
};

export default itemService;