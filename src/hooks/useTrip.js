import { useEffect, useState } from "react";

import {
  listenTrip,
  updateTrip,
} from "../services/tripCloudService";

export default function useTrip(tripId) {

  const [trip, setTrip] = useState(null);

  useEffect(() => {

    if (!tripId) return;

    const unsubscribe = listenTrip(

      tripId,

      (data) => {

        setTrip(data);

      }

    );

    return unsubscribe;

  }, [tripId]);

  async function saveTrip(updatedTrip) {

    await updateTrip(

      tripId,

      updatedTrip

    );

  }

  return {

    trip,

    updateTrip: saveTrip,

  };

}