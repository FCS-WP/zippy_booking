import React from "react";
import ReactDOM from "react-dom/client";
import Index from "./Pages/Bookings";
import Dashboard from "./Pages/Dashboard";
import ProductsBooking from "./Pages/ProductsBooking";

function initializeApp() {
  const zippyBookings = document.getElementById("root_app");
  const zippyDashboard = document.getElementById("zippy_dashboard");
  const zippyProductsBooking = document.getElementById("zippy_products_booking");

  if (zippyBookings) {
    const root = ReactDOM.createRoot(zippyBookings);
    root.render(
        <Index />
    );
  }
  if (zippyDashboard) {
    const root = ReactDOM.createRoot(zippyDashboard);
    root.render(
        <Dashboard />
    );
  }
  if (zippyProductsBooking) {
    const root = ReactDOM.createRoot(zippyProductsBooking);
    root.render(
      <ProductsBooking />
    );
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);
