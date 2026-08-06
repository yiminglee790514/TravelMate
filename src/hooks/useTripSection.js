import useTrip from "./useTrip";

export default function useTripSection(
  tripId,
  section,
  defaultValue
) {

  const {
    trip,
    updateTrip,
  } = useTrip(tripId);

  const data =
    trip?.[section] ?? defaultValue;

  async function save(newData) {

    if (!trip) return;

    await updateTrip({

      ...trip,

      [section]: newData,

    });

  }

  return {

    trip,

    data,

    save,

  };

}