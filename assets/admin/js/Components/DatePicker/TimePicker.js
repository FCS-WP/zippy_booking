import React from 'react';
import DatePicker from 'react-datepicker';
import { Box } from '@mui/material';

// Custom TimePicker component
const TimePicker = ({ selectedTime, onChange, duration }) => {
  return (
    <Box sx={{ width: "200px" }}>
      <DatePicker
        selected={selectedTime}
        onChange={onChange}
        showTimeSelect
        showTimeSelectOnly
        timeCaption="Time"
        dateFormat="HH:mm"
        timeIntervals={duration}
        isClearable
        placeholderText="Pick a time"
      />
    </Box>
  );
};

export default TimePicker;
