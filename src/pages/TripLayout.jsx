import { Outlet, useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import useTrip from "../hooks/useTrip";
import { canEdit } from "../services/permissionService";
import TripHeader from "../components/trip/TripHeader";
import BottomNav from "../components/trip/BottomNav";
import { preloadWeatherForTrip } from "../services/weatherService";

export default function TripLayout() {
  const { id } = useParams();
  const location = useLocation();
  const { trip } = useTrip(id);

  // 進入旅程後就先在背景準備天氣；WeatherPage 會共用同一份請求/cache。
  useEffect(() => {
    if (trip?.weather?.length) {
      preloadWeatherForTrip(trip.weather);
    }
  }, [trip]);

  if (!trip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        載入中...
      </div>
    );
  }

  const editable = canEdit(trip);

  return (
    <div className="tm-app-shell">
      <TripHeader trip={trip} readonly={!editable} showAI />

      <main className="tm-page-content">
        <Outlet context={{ trip, pathname: location.pathname }} />
      </main>

      <BottomNav />
    </div>
  );
}
