import React, { useState, useEffect, useRef } from "react";
import {
  Container,
} from "@mui/material";

import ListBooking from "./history/ListBooking";
import LoginMessage from "./history/LoginMessage";


const BookingHistory = () => {
  const adminData = window.admin_data ? window.admin_data : null;
  console.log(adminData)
  return (
    <Container>
      {adminData.user_email ? (
        <ListBooking />
      ): (
        <LoginMessage />
      )}
    </Container>
  );
};

export default BookingHistory;
