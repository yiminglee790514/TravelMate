export async function generateAIPlan({ trip, date, day, startTime, endTime, transport, existingItems }) {
  const response = await fetch("/api/ai-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      trip: {
        title: trip?.title || "",
        destination: [trip?.country, trip?.city, trip?.destination, trip?.location].filter(Boolean).join("｜"),
        startDate: trip?.startDate || "",
        endDate: trip?.endDate || "",
      },
      date,
      day,
      startTime,
      endTime,
      transport,
      existingItems: (existingItems || []).map((item) => ({
        time: item.time || "",
        title: item.title || item.name || "",
        type: item.type || "",
        address: item.address || "",
        note: item.note || "",
      })),
      hotelGroups: Array.isArray(trip?.hotelGroups)
        ? trip.hotelGroups.map((group) => ({
            title: group.title || "",
            checkIn: group.checkIn || "",
            checkOut: group.checkOut || "",
            hotels: Array.isArray(group.hotels)
              ? group.hotels.map((hotel) => ({
                  name: hotel.name || "",
                  address: hotel.address || "",
                  checkInTime: hotel.checkInTime || "",
                  checkOutTime: hotel.checkOutTime || "",
                }))
              : [],
          }))
        : [],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `Gemini AI 規劃失敗（${response.status}）`);
  }
  return data;
}
