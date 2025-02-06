import { TextField } from "@mui/material";
import React, { useState } from "react";
import DatePicker from "react-datepicker";

const CustomSelectTime = ({ duration, onChangeTime, type }) => {
  const [time, setTime] = useState(null);
  const handleTimeChange = (date) => {
    setTime(date);
    onChangeTime(date, type)
  };
  return (
    <DatePicker
      width={"100%"}
      selected={time}
      onChange={handleTimeChange}
      showTimeSelect
      showTimeSelectOnly
      timeCaption="Time"
      dateFormat="HH:mm"
      timeIntervals={duration}
      isClearable
      placeholderText="Pick a time"
      customInput={
        <TextField
          label="Select Time"
          fullWidth
          sx={{ width: "100%" }}
          color="success"
        />
      }
    />
  );
};

export default CustomSelectTime;
