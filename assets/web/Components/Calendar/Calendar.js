import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useDateContext } from '../Booking/DateContext';
import dataBooking from "../../js/json/booking_list.json";

function Calendar() {
    const { selectedDate, setSelectedDate } = useDateContext();
    const weekdays = dataBooking.data.config.weekdays.map(Number);


    const isWeekday = (date) => {
      const day = date.getDay(); 
      return weekdays.includes(day);
    };
    return (
      <>
        <h6>Select date</h6>
        <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="dd/MM/yyyy"
        inline
        minDate={new Date()}
        filterDate={isWeekday}
        />
      </>
    );
    
}

export default Calendar;
