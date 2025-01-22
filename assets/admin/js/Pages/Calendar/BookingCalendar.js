import React, { useState } from "react";
import Header from "../../Components/Layouts/Header";
import { Box } from "@mui/material";
import AdminLoader from "../../Components/AdminLoader";
import { ToastContainer } from "react-toastify";
import ViewCalendar from "../../Components/Calendar/ViewCalendar";

const BookingCalendar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const title=`Calendar`;
  return (
    <>
      <Header title={title} />
      <Box className="calendar-page">
        {isLoading ? (
          <Box sx={{ position: "relative", marginRight: "3rem" }}>
            <AdminLoader />
          </Box>
        ) : (
          <ViewCalendar />
        )}
        <ToastContainer />
      </Box>
    </>
  );
};

export default BookingCalendar;
