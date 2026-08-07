import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import TripDashboard from "./pages/TripDashboard";
import ItineraryPage from "./pages/ItineraryPage";
import FlightPage from "./pages/FlightPage";
import { useEffect, useState } from "react";
import { listenAuth } from "./services/authService";
import Login from "./pages/Login";
import { syncCloudToLocal } from "./services/cloudService";
import HotelPage from "./pages/HotelPage";
import TransportPage from "./pages/TransportPage";
import WeatherPage from "./pages/WeatherPage";
import SharePage from "./pages/SharePage";
import { createUserProfile } from "./services/userService";
import PackingPage from "./pages/PackingPage";

export default function App() {

  const [user, setUser] = useState(undefined);

useEffect(() => {

  const unsubscribe = listenAuth(async (currentUser) => {

    if (currentUser) {

      try {

        // 第一次登入建立 users/{uid}
        await createUserProfile();

        // 再同步旅程
        await syncCloudToLocal();

      } catch (err) {

        console.error(err);

      }

    }

    setUser(currentUser);

  });

  return unsubscribe;

}, []);

  if (user === undefined) {
    return null;
  }

  if (!user) {
  return <Login />;
}

return (
  <BrowserRouter key={user.uid}>
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/share/:shareId"
        element={<SharePage />}
      />

      <Route
        path="/share/:shareId/flight"
        element={<FlightPage />}
      />

      <Route
        path="/share/:shareId/hotel"
        element={<HotelPage />}
      />

      <Route
        path="/share/:shareId/transport"
        element={<TransportPage />}
      />

      <Route
        path="/share/:shareId/weather"
        element={<WeatherPage />}
      />

      <Route
        path="/share/:shareId/itinerary"
        element={<ItineraryPage />}
      />

      <Route
        path="/trip/:id/weather"
        element={<WeatherPage />}
      />

      <Route
        path="/trip/:id/packing"
        element={<PackingPage />}
      />

      <Route
        path="/trip/:id"
        element={<TripDashboard />}
      />

      <Route
        path="/trip/:id/transport"
        element={<TransportPage />}
      />

      <Route
        path="/trip/:id/flight"
        element={<FlightPage />}
      />

      <Route
        path="/trip/:id/hotel"
        element={<HotelPage />}
      />

      <Route
        path="/trip/:id/itinerary"
        element={<ItineraryPage />}
      />

    </Routes>
  </BrowserRouter>
);
}