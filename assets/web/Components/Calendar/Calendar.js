import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useDateContext } from '../Booking/DateContext';

function Calendar() {
    const { selectedDate, setSelectedDate } = useDateContext();

    return (
      <>
        <h6>Select date</h6>
        <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="dd/MM/yyyy"
        inline
        minDate={new Date()}
        />
      </>
    );
    
}

export default Calendar;
