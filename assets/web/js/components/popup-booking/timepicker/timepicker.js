import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

const Timepicker = ({ onStartTimeSelect, onEndTimeSelect, bookings, configs, configsDate }) => {
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    
    const formatDate = (dateString) => {
      const dateObject = new Date(dateString);
      const year = dateObject.getFullYear();
      const month = String(dateObject.getMonth() + 1).padStart(2, "0");
      const day = String(dateObject.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const getDayOfWeek = (date) => {
      const daysOfWeek = ["0", "1", "2", "3", "4", "5", "6"];
      return daysOfWeek[date.getDay()];
    };
    
    const getTimeParts = (timeString) => {
      const time = new Date('1970-01-01T' + timeString + ':00Z'); 
      const hours = time.getUTCHours();
      const minutes = time.getUTCMinutes();
      return { hours, minutes };
    };

    const indexDate = parseInt(getDayOfWeek(new Date(formatDate(configsDate))), 10);

    const TimeStore =  configs.store_working_time.find(day => day.weekday === indexDate);

    const minTime = new Date();
    minTime.setHours(getTimeParts(TimeStore.open_at).hours, getTimeParts(TimeStore.open_at).minutes, 0); 
    // minTime.setHours(HH, MM, SS); 

    const maxTime = new Date();
    maxTime.setHours(getTimeParts(TimeStore.close_at).hours, getTimeParts(TimeStore.close_at).minutes, 0);

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
            timeIntervals={configs.duration}
            timeCaption="Start Time"
            dateFormat="h:mm aa"
            filterTime={isTimeDisabled}
            minTime={minTime} 
            maxTime={maxTime} 
          />
        </div>
        <div className="col_booking_time">
          <h6>End Time:</h6>
          <DatePicker
            selected={endTime}
            onChange={handleEndTimeChange}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={configs.duration}
            timeCaption="End Time"
            dateFormat="h:mm aa"
            filterTime={isTimeDisabled}
            minTime={minTime} 
            maxTime={maxTime} 
          />
        </div>
      </div>
    );
  };
  
  export default Timepicker;