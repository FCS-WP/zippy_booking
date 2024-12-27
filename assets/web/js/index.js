import React from "react";
import ReactDOM from "react-dom/client";
import BookingForm from "./BookingForm";

document.addEventListener("DOMContentLoaded", function () {
  const zippyMain = document.getElementById("zippy-root");

  if (typeof zippyMain != "undefined" && zippyMain != null) {
    const root = ReactDOM.createRoot(zippyMain);
    root.render(<BookingForm />);
  }
});

