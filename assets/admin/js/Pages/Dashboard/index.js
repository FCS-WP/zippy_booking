import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import { makeRequest } from "../../api/axios";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Bookings } from "../../api/bookings";

const getDateRange = (baseDate, startOffset, endOffset) => {
  const start = new Date(baseDate);
  start.setDate(start.getDate() + startOffset);

  const end = new Date(baseDate);
  end.setDate(end.getDate() + endOffset);

  return { start, end };
};

const Dashboard = () => {
  const [startDate, setStartDate] = useState(() => {
    const initialDateRange = getDateRange(new Date(), -7, 0);
    return initialDateRange.start;
  });
  const [endDate, setEndDate] = useState(() => {
    const initialDateRange = getDateRange(new Date(), -7, 0);
    return initialDateRange.end;
  });
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await Bookings.getBookings();

      if (response.data && response.data.status === "success") {
        const bookingsData = response.data.data.bookings;
        setBookings(bookingsData);
        filterBookings(bookingsData, { start: startDate, end: endDate });
      } else {
        console.error("Error fetching bookings:", response.error);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    filterBookings(bookings, { start, end });
  };

  const filterBookings = (bookings, dateRange) => {
    const { start, end } = dateRange;
    const filtered = bookings.filter((booking) => {
      const bookingStartDate = new Date(booking.booking_start_date);

      return bookingStartDate >= start && bookingStartDate <= end;
    });
    setFilteredBookings(filtered);
  };

  const getTotalBookings = () => filteredBookings.length;

  const getCompletedBookings = () =>
    filteredBookings.filter((booking) => booking.booking_status === "completed")
      .length;

  const getPendingBookings = () =>
    filteredBookings.filter((booking) => booking.booking_status === "pending")
      .length;

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="flex-end" mb={4}>
        <div className="date-picker">
          <CalendarMonthIcon />
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline={false}
            className="form-control"
          />
        </div>
      </Box>
      <Grid container spacing={3}>
        <DashboardCard title="Total Bookings" value={getTotalBookings()} />
        <DashboardCard
          title="Completed Bookings"
          value={getCompletedBookings()}
          highlight="success.main"
        />
        <DashboardCard
          title="Pending Bookings"
          value={getPendingBookings()}
          highlight="warning.main"
        />
      </Grid>
    </Box>
  );
};

const DashboardCard = ({ title, value, highlight }) => {
  return (
    <Grid item xs={12} sm={6} md={4} lg={2}>
      <Card elevation={3}>
        <CardContent>
          <Typography
            variant="h3"
            color={highlight || "text.primary"}
            gutterBottom
          >
            {value}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default Dashboard; 
