import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

const Timepicker = ({ onStartTimeSelect, onEndTimeSelect, bookings }) => {
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
    
    const disabledTimeRanges = bookings.map((booking) => ({
      start: booking.booking_start_time,
      end: booking.booking_end_time,
    }));

    const filteredTimeRanges = disabledTimeRanges.filter(
      (range) => range.start !== range.end
    );
  
    const isTimeDisabled = (time) => {
      const timeString = time.toTimeString().split(' ')[0];
      return !filteredTimeRanges.some(
        (range) => timeString >= range.start && timeString <= range.end
      );
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
            filterTime={isTimeDisabled}
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
            filterTime={isTimeDisabled}
          />
        </div>
      </div>
    );
  };
  
  export default Timepicker;