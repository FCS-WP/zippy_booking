import React, { useState } from "react";
import DatePicker from "react-datepicker";
const BookingDatePicker = ({ handleSelectDate }) => {
  const config = {
    booking_type: "single",
    duration: 30,
    allow_overlap: 1,
    store_email: "nha.le@floatingcube.com",
    store_working_time: [
      {
        is_open: 1,
        weekday: 0,
        open_at: "10:00",
        close_at: "20:00",
      },
      {
        is_open: 1,
        weekday: 1,
        open_at: "10:00",
        close_at: "20:00",
      },
      {
        is_open: 1,
        weekday: 2,
        open_at: "10:00",
        close_at: "20:00",
      },
      {
        is_open: 1,
        weekday: 3,
        open_at: "10:00",
        close_at: "20:00",
      },
      {
        is_open: 1,
        weekday: 4,
        open_at: "10:00",
        close_at: "20:00",
      },
      {
        is_open: 1,
        weekday: 5,
        open_at: "10:00",
        close_at: "20:00",
      },
      {
        is_open: 1,
        weekday: 6,
        open_at: "10:00",
        close_at: "20:00",
      },
    ],
  };
  const [selectedDate, setSelectedDate] = useState();

  // Parse working time configuration
  const workingTime = config.store_working_time;

  // Adjust the weekday mapping: 0 (Monday) to 6 (Sunday)
  const remapWeekday = (day) => (day === 6 ? 0 : day + 1);

  // Get valid days of the week
  const allowedDays = workingTime
    .filter((day) => day.is_open === 1)
    .map((day) => remapWeekday(day.weekday));
  // Disable unavailable days
  const isDayDisabled = (date) => {
    const dayOfWeek = remapWeekday(date.getDay());
    return !allowedDays.includes(dayOfWeek);
  };

  const dateOnchange = (date) => {
    setSelectedDate(date);
    handleSelectDate(date);
  };
  return (
    <div>
      <h4>Choose Booking Date and Time</h4>
      <DatePicker
        minDate={new Date()}
        selected={selectedDate}
        onChange={(date) => dateOnchange(date)}
        filterDate={(date) => !isDayDisabled(date)}
        inline
      />
    </div>
  );
};

export default BookingDatePicker;
