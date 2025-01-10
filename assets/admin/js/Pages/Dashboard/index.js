import React, { useState, useEffect } from "react";
import {
  Box,
  Grid2,
  Stack,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { Bookings } from "../../api/bookings";
import Loading from "../../Components/Loading";
import BookingMainChart from "../../Components/Charts/BookingMainChart";
import Header from "../../Components/Layouts/Header";
import CustomeDatePicker from "../../Components/DatePicker/CustomeDatePicker";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      setLoading(true);
      setTimeout(() => {
        filterBookings(bookings, { start, end });
        setLoading(false);
      }, 500);
    } else {
      filterBookings(bookings, { start, end });
    }
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
  const title = "Booking Dashboad";
  return (
    <Stack>
      <Header title={title}></Header>
      <Stack>
        <Box>
          {loading ? (
            <Loading />
          ) : (
            <>
              <Box display="flex" justifyContent="flex-end" mb={4}>
                <CustomeDatePicker
                  startDate={startDate}
                  handleDateChange={handleDateChange}
                  endDate={endDate}
                />
              </Box>
              <Grid2 container size={4} spacing={2}>
                <DashboardCard
                  title="Total Bookings"
                  value={getTotalBookings()}
                />
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
              </Grid2>
            </>
          )}
        </Box>
        <Stack mt={2}>
          <Grid2 container>
            <Grid2 size={6}>
              <BookingMainChart />
            </Grid2>
          </Grid2>
        </Stack>
      </Stack>
    </Stack>
  );
};

const DashboardCard = ({ title, value, highlight }) => {
  return (
    <Grid2 xs={12} sm={6} md={4} lg={2}>
      <Card
        style={{
          minWidth: "215px",
        }}
        elevation={3}
      >
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
    </Grid2>
  );
};

export default Dashboard;
