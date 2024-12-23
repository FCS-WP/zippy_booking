import React from "react";
import ReactDOM from "react-dom/client";
import Bookings from "./Pages/Bookings";
import Dashboard from "./Pages/Dashboard";

function initializeApp() {
  const zippyBookings = document.getElementById("root_app");
  const zippyDashboard = document.getElementById("zippy_dashboard");

  if (zippyBookings) {
    const root = ReactDOM.createRoot(zippyBookings);
    root.render(
      <React.StrictMode>
        <Bookings />
      </React.StrictMode>
    );
  }

  if (zippyDashboard) {
    const root = ReactDOM.createRoot(zippyDashboard);
    root.render(
      <React.StrictMode>
       <Dashboard />
      </React.StrictMode>
    );
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);
