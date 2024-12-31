import React, { useState, useEffect, useRef } from "react";
import { Container } from "@mui/material";

import ListBooking from "./history/ListBooking";
import LoginMessage from "./history/LoginMessage";
import { ToastContainer } from "react-toastify";

const BookingHistory = () => {
  const adminData = window.admin_data ? window.admin_data : null;
  
  return (
    <Container>
      {adminData.user_email ? <ListBooking /> : <LoginMessage />}
      <ToastContainer />
    </Container>
  );
};

export default BookingHistory;
