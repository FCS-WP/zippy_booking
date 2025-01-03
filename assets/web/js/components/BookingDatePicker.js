import React, { useState } from "react";
import DatePicker from "react-datepicker";
const BookingDatePicker = ({ handleSelectDate , config }) => {

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
