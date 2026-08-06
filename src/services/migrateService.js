import tripService from "./tripService";

import {
  createTrip,
  getTripsByUser,
} from "./tripCloudService";

/* ===========================
   第一次搬資料
=========================== */

export async function migrateTrips() {

  // Firestore 已經有資料就不用搬
  const cloudTrips = await getTripsByUser();

  if (cloudTrips.length > 0) {

    console.log("Firestore 已有旅程，略過 Migration");

    return;

  }

  // localStorage
  const localTrips = tripService.getTrips();

  if (localTrips.length === 0) {

    console.log("沒有 Local 資料");

    return;

  }

  console.log(`開始搬移 ${localTrips.length} 筆旅程`);

  for (const trip of localTrips) {

    const copy = {

      ...trip,

    };

    delete copy.id;

    await createTrip(copy);

  }

  console.log("Migration 完成");

}