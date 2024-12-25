import React, { useState } from "react";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Content = () => {
  const [startDate, setStartDate] = useState(new Date("2024-12-16"));
  const [endDate, setEndDate] = useState(new Date("2024-12-22"));

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="flex-end" mb={4}>
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline={false}
          className="form-control"
        />
      </Box>
      <Grid container spacing={3}>
        <DashboardCard title="Total Bookings" value="0" />
        <DashboardCard title="Completed Bookings" value="0" highlight="success.main" />
        <DashboardCard title="Pending Bookings" value="0" highlight="warning.main" />
      </Grid>
    </Box>
  );
};

const DashboardCard = ({ title, value, highlight }) => {
  return (
    <Grid item xs={12} sm={6} md={4} lg={2}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h3" color={highlight || "text.primary"} gutterBottom>
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

export default Content;
