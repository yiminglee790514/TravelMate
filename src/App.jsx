import { BrowserRouter, Routes, Route } from "react-router-dom";
import FlightPage from "./pages/FlightPage";

import Home from "./pages/Home";
import TripDashboard from "./pages/TripDashboard";
import ItineraryPage from "./pages/ItineraryPage";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/trip/:id/flight"
          element={<FlightPage />}
        />

        <Route
          path="/trip/:id"
          element={<TripDashboard />}
        />

        <Route
          path="/trip/:id/itinerary"
          element={<ItineraryPage />}
        />

      </Routes>

    </BrowserRouter>
  );
}