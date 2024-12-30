import React, { useEffect, useState } from "react";
import { useDateContext } from '../Booking/DateContext';
import DatePicker from "react-datepicker";
import { webApi } from "../../js/api";

function Timepicker() {
  const { selectedDate } = useDateContext();
  const [dataBooking, setDataBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 15 * 60 * 1000));

  const getTimeFunction = async () => {
    try {
      setLoading(true);
      setError(null);

      const formattedDate = selectedDate.toISOString().split("T")[0];
      const params = {
        booking_start_date: formattedDate,
        booking_end_date: formattedDate,
      };

      const bookings = await webApi.getBookings(params);
      setDataBooking(bookings.data || []);

      // console.log("Bookings data:", bookings.data);
    } catch (err) {
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTimeFunction();
  }, [selectedDate]);

  
  const today = new Date();
  const isFutureDate = selectedDate > today;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="row-booking">
      <div className="col_booking_time">
        <h6>Begin Time:</h6>
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
          // minTime={minTime} // 
          // maxTime={maxTime} // 
        />
      </div>
      <div className="col_booking_time">
        <h6>End Time:</h6>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption="End Time"
          dateFormat="h:mm aa"
          // minTime={minTime} 
          // maxTime={maxTime} 
        />
      </div>
    </div>
  );
    
}

export default Timepicker;