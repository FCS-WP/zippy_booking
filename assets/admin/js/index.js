import React from "react";
import ReactDOM from "react-dom/client";
import Dashboard from "./Components/Pages/Dashboad";



document.addEventListener("DOMContentLoaded", function () {
    const zippyMain = document.getElementById("zippy-dashboard");
  
    if (typeof zippyMain != "undefined" && zippyMain != null) {
      const root = ReactDOM.createRoot(zippyMain);
      root.render(<Dashboard />);
    }
  });
