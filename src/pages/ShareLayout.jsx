import { Outlet, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getShare } from "../services/shareService";
import TripHeader from "../components/trip/TripHeader";
import BottomNav from "../components/trip/BottomNav";
import { buildWeatherDaysForTrip, prefetchWeatherForTrip } from "../services/weatherService";

export default function ShareLayout() {
  const { shareId } = useParams();
  const location = useLocation();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    let active = true;
    getShare(shareId).then((data) => {
      if (active) setTrip(data);
    });
    return () => {
      active = false;
    };
  }, [shareId]);

  useEffect(() => {
    if (!trip) return;
    prefetchWeatherForTrip(buildWeatherDaysForTrip(trip));
  }, [trip]);

  if (!trip) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">載入中...</div>;
  }

  return (
    <div className="tm-app-shell">
      <TripHeader trip={trip} readonly showAI={false} />

      <main className="tm-page-content">
        <Outlet context={{ trip, pathname: location.pathname }} />
      </main>

      <BottomNav share />
    </div>
  );
}
