import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
const BookingDatePicker = ({ handleSelectDate , config }) => {

  const [selectedDate, setSelectedDate] = useState();
  
  // Parse working time configuration
  const workingTime = config.store_working_time;
<<<<<<< HEAD
  
  // Get valid days of the week
  const allowedDays = workingTime
    .filter(item => item.is_open === 'T');
  
  // Disable unavailable days
  const isDayDisabled = (date) => {
    const dayOfWeek = date.getDay().toString();
    const isOpen = allowedDays.some(date => date.is_open === 'T' && date.weekday === dayOfWeek);
    return !isOpen;
=======

  // Get valid days of the week
  const allowedDays = workingTime
    .filter((day) => day.is_open == 'T')
    .map((day) => parseInt(day.weekday));
    
  const isDayDisabled = (date) => {
    const dayOfWeek = date.getDay();
    return !allowedDays.includes(dayOfWeek);
>>>>>>> d7f5441074c7878127d72021a1cac464ded8a3ed
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
