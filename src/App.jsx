import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import TripLayout from "./pages/TripLayout";

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
import ExpensePage from "./pages/ExpensePage";

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
        path="/trip/:id"
        element={<TripLayout />}
      >

      <Route
        path="/trip/:id/expense"
        element={<ExpensePage />}
      />  
              
        {/* 一進旅程直接進行程 */}

        <Route
          index
          element={
            <Navigate
              to="itinerary"
              replace
            />
          }
        />

        <Route
          path="itinerary"
          element={<ItineraryPage />}
        />

        <Route
          path="flight"
          element={<FlightPage />}
        />

        <Route
          path="hotel"
          element={<HotelPage />}
        />

        <Route
          path="transport"
          element={<TransportPage />}
        />

        <Route
          path="weather"
          element={<WeatherPage />}
        />

        <Route
          path="packing"
          element={<PackingPage />}
        />

      </Route>

    </Routes>
  </BrowserRouter>
);
}