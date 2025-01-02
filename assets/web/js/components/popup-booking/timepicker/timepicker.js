import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

const Timepicker = ({ onStartTimeSelect, onEndTimeSelect }) => {
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
  
    const handleStartTimeChange = (time) => {
      setStartTime(time);
      onStartTimeSelect(time); 
    };
  
    const handleEndTimeChange = (time) => {
      setEndTime(time);
      onEndTimeSelect(time);
    };
  
    return (
      <div className="row-booking">
        <div className="col_booking_time">
          <h6>Begin Time:</h6>
          <DatePicker
            selected={startTime}
            onChange={handleStartTimeChange}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Start Time"
            dateFormat="h:mm aa"
          />
        </div>
        <div className="col_booking_time">
          <h6>End Time:</h6>
          <DatePicker
            selected={endTime}
            onChange={handleEndTimeChange}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="End Time"
            dateFormat="h:mm aa"
          />
        </div>
      </div>
    );
  };
  
  export default Timepicker;