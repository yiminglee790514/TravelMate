import { Outlet, useLocation, useParams } from "react-router-dom";
import useTrip from "../hooks/useTrip";
import { canEdit } from "../services/permissionService";
import TripHeader from "../components/trip/TripHeader";
import BottomNav from "../components/trip/BottomNav";

export default function TripLayout() {
  const { id } = useParams();
  const location = useLocation();
  const { trip } = useTrip(id);

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
