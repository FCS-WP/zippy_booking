import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

function Calendar({ onDateSelect }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onDateSelect(date); 
  };

  return (
    <>
      <h6>Select date</h6>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange} 
        dateFormat="dd/MM/yyyy"
        inline
        minDate={new Date()}
      />
    </>
  );
}

export default Calendar;
