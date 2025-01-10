import React from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DatePicker from "react-datepicker";

const CustomeDatePicker = ({
  startDate,
  handleDateChange,
  endDate,
  selectsRange = true,
  placeholderText = "Select date",
}) => {
  return (
    <div className={`zippy-date-picker ${selectsRange ? "range-picker" : ""}`}>
      <CalendarMonthIcon color="secondary" />
      <DatePicker
        selected={startDate}
        onChange={handleDateChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange={selectsRange}
        inline={false}
        className="form-control"
        dateFormat="MMMM d, yyyy"
        isClearable
        placeholderText={placeholderText}
      />
    </div>
  );
};

export default CustomeDatePicker;
