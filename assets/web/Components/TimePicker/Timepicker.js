import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useDateContext } from '../Booking/DateContext';

function Timepicker() {
  const { selectedDate } = useDateContext();
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const today = new Date();

  const isFutureTimeForBegin = (time) => {
    const currentDate = new Date();
    return time >= currentDate;
  };

  const isFutureTimeForEnd = (time) => {
    return time > startDate;
  };

  if (selectedDate > today) {
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
            filterTime={(time) => {
              const hours = time.getHours(); // Lấy giờ từ đối tượng Date
              return hours < 20 || hours >= 21; // Chỉ cho phép các giờ trước 9 AM và sau 11 AM
            }}
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
               filterTime={isFutureTimeForBegin}
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
              filterTime={isFutureTimeForEnd}
            />
          </div>
        </div>
      );
  }
    
}

export default Timepicker;