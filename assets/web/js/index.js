import React from "react";
import ReactDOM from "react-dom/client";
import Booking from "../Components/Booking/Booking";
import BookingForm from "./BookingForm";
import BookingHistory from "./components/BookingHistory";

document.addEventListener("DOMContentLoaded", function () {
  const popUpBtn = document.getElementById("btn_booking");

  if (typeof popUpBtn != "undefined" && popUpBtn != null) {
    const root = ReactDOM.createRoot(popUpBtn);
    root.render(
      <Booking/>
    );
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const zippyMain = document.getElementById("zippy-root");

  if (typeof zippyMain != "undefined" && zippyMain != null) {
    const root = ReactDOM.createRoot(zippyMain);
    root.render(<BookingForm />);
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const zippyMain = document.getElementById("zippy-booking-history");

  if (typeof zippyMain != "undefined" && zippyMain != null) {
    const root = ReactDOM.createRoot(zippyMain);
    root.render(<BookingHistory />);
  }
});
