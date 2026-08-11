import { useEffect, useRef, useState } from "react";

import {
  listenTrip,
  updateTrip,
} from "../services/tripCloudService";

export default function useTrip(tripId) {
  const [trip, setTrip] = useState(null);
  const pendingSaveRef = useRef(false);

  useEffect(() => {
    if (!tripId) return;

    pendingSaveRef.current = false;

    const unsubscribe = listenTrip(tripId, (data) => {
      // Firestore 即時監聽有機會在寫入完成前先送出舊快照。
      // 儲存期間保留 optimistic UI，避免修改後畫面又跳回舊資料。
      if (pendingSaveRef.current) return;
      setTrip(data);
    });

    return unsubscribe;
  }, [tripId]);

  async function saveTrip(updatedTrip) {
    // 先更新 hook 內的資料，讓所有頁面立即看到新內容。
    pendingSaveRef.current = true;
    setTrip(updatedTrip);

    try {
      await updateTrip(tripId, updatedTrip);
    } finally {
      // 寫入完成後重新接受 Firestore 的最新快照。
      pendingSaveRef.current = false;
    }
  }

  return {
    trip,
    updateTrip: saveTrip,
  };
}
