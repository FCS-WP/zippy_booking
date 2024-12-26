import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useDateContext } from '../Booking/DateContext';
import dataBooking from "../../js/json/booking_list.json";

function Timepicker() {
  const { selectedDate } = useDateContext();
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const openHour = dataBooking.data.config.open_at.split(':')[0];
  const closeHour = dataBooking.data.config.close_at.split(':')[0];

  const today = new Date();

  const isFutureTimeForBegin = (time) => {
    const currentDate = new Date();
    return (time >= currentDate);
  };
  
  const minTime = new Date();
  minTime.setHours(openHour, 0, 0); 

  const maxTime = new Date();
  maxTime.setHours(closeHour, 0, 0);


  const isFutureTimeForEnd = (time) => {
    return (time > startDate);
  };

  const isMatchingDate = (selectedDate, targetDate) => {

    const selectedDateObj = new Date(selectedDate);
  
    const selectedDateFormatted = selectedDateObj.toISOString().split("T")[0];
    return selectedDateFormatted === targetDate;
  };
  
  const BookedTime = (time) =>{
    const hours = time.getHours(); 
    const bookedTimes = [];

    dataBooking.data.booking.forEach((item) => {
      if (isMatchingDate(selectedDate, item.start_date)) {
        const startTime = parseInt(item.start_time.split(':')[0], 10);
        const endTime = parseInt(item.end_time.split(':')[0], 10);
        
        bookedTimes.push({ start_time: startTime, end_time: endTime });
      }
    });

    return !bookedTimes.some((item) => item.start_time <= hours && item.end_time > hours);
    
  }

  const filterTimeStart = (time) => {
    return isFutureTimeForBegin(time) && BookedTime(time);
  };

  const filterTimeEnd = (time) => {
    return isFutureTimeForEnd(time) && BookedTime(time);
  };
  if (selectedDate > today) {
    
    // BookedTime();
    return (
      <div class="row-booking">
        <div class="col_booking_time">
          <h6>Begin Time: </h6>
          <DatePicker
             selected={startDate}
             onChange={(date) => {
               setStartDate(date);

               if (date >= endDate) {
                 setEndDate(new Date(date.getTime() + 15 * 60 * 1000)); 
               }
             }}
             showTimeSelect
             showTimeSelectOnly
             timeIntervals={15}
             timeCaption="Start Time"
             minTime={minTime}  // Set the minimum time
              maxTime={maxTime}  // Set the maximum time
             dateFormat="h:mm aa"
             filterTime={BookedTime}
          />
        </div>
        <div class="col_booking_time">
          <h6>End Time: </h6>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="End Time"
            dateFormat="h:mm aa"
            minTime={minTime}  // Set the minimum time
            maxTime={maxTime}  // Set the maximum time
            filterTime={filterTimeEnd}
          />
        </div>
      </div>
    );
  }else{
    return (
        <div class="row-booking">
          <div class="col_booking_time">
            <h6>Begin Time: </h6>
            <DatePicker
               selected={startDate}
               onChange={(date) => {
                 setStartDate(date);

                 if (date >= endDate) {
                   setEndDate(new Date(date.getTime() + 15 * 60 * 1000)); 
                 }
               }}
               showTimeSelect
               showTimeSelectOnly
               timeIntervals={15}
               timeCaption="Start Time"
               dateFormat="h:mm aa"
               minTime={minTime}  // Set the minimum time
                maxTime={maxTime}  // Set the maximum time
               filterTime={filterTimeStart}
            />
          </div>
          <div class="col_booking_time">
            <h6>End Time: </h6>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="End Time"
              minTime={minTime}  // Set the minimum time
              maxTime={maxTime}  // Set the maximum time
              dateFormat="h:mm aa"
              filterTime={filterTimeEnd}
            />
          </div>
        </div>
      );
  }
    
}

export default Timepicker;