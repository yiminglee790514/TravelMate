import * as cloud from "./tripCloudService";

/* ===========================
   Trip Repository
=========================== */

export async function getTrips() {

  return await cloud.getMyTrips();

}

export async function getTrip(id) {

  return await cloud.getTrip(id);

}

export async function addTrip(trip) {

  return await cloud.createTrip(trip);

}

export async function updateTrip(trip) {

  return await cloud.updateTrip(
    trip.id,
    trip
  );

}

export async function deleteTrip(id) {

  return await cloud.deleteTrip(id);

}

export default {

  getTrips,
  getTrip,
  addTrip,
  updateTrip,
  deleteTrip,

};