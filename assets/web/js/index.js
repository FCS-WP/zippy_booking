import React from "react";
import ReactDOM from "react-dom/client";
import Booking from "../Components/Booking/Booking";

document.addEventListener("DOMContentLoaded", function () {
  const zippyMain = document.getElementById("btn_booking");

  if (typeof zippyMain != "undefined" && zippyMain != null) {
    const root = ReactDOM.createRoot(zippyMain);
    root.render(
      <Booking/>
    );
  }
});

