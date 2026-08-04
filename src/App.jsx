import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import TripDashboard from "./pages/TripDashboard";
import ItineraryPage from "./pages/ItineraryPage";
import FlightPage from "./pages/FlightPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/trip/:id"
          element={<TripDashboard />}
        />

        <Route
          path="/trip/:id/flight"
          element={<FlightPage />}
        />

        <Route
          path="/trip/:id/itinerary"
          element={<ItineraryPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}