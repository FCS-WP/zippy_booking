import React from "react";
import ReactDOM from "react-dom/client";
import Bookings from "./Pages/Bookings";

function initializeApp() {
  const zippyBookings = document.getElementById("root_app");

  if (zippyBookings) {
    const root = ReactDOM.createRoot(zippyBookings);
    root.render(
      <React.StrictMode>
        <Bookings />
      </React.StrictMode>
    );
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);
