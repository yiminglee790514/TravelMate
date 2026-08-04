import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import TripDetail from "./pages/TripDetail";

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
          element={<TripDetail />}
        />

      </Routes>

    </BrowserRouter>
  );
}