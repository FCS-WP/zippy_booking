import React, { useEffect, useState } from "react";
import { useDateContext } from '../Booking/DateContext';
import { webApi } from "../../js/api";

function convertToTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString(); 
}

function Prebooking() {
  const { selectedDate } = useDateContext();
  const [dataBooking, setDataBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDataFunction = async () => {
      try {
          setLoading(true);
          setError(null); 

          const formattedDate = selectedDate.toISOString().split('T')[0];
          const params = {
              booking_start_date: formattedDate,
              booking_end_date: formattedDate,
          };

          const bookings = await webApi.getBookings(params);

          if (bookings.data.status !== 'success') {
              throw new Error('Failed to fetch bookings');
          }

          const bookingsData = bookings.data.data?.bookings;
          setDataBooking(bookingsData || []);
      } catch (err) {
          setError(err.message || 'An unknown error occurred');
      } finally {
          setLoading(false); // End loading
      }
  };

  useEffect(() => {
      getDataFunction();
  }, [selectedDate]);

  if (loading) {
      return <div>Loading...</div>;
  }

  if (error) {
      return <div>Error: {error}</div>;
  }

  if (!dataBooking || dataBooking.length === 0) {
      return <div>No bookings available for the selected date.</div>;
  }

  return (
      <div>
          <h6>Pre-order Schedule</h6>
          <div className="row-booking">
              {dataBooking.map((booking, index) => (
                  <div className="col_booking_time" key={booking.ID}>
                    <div className="pre_booking_items">
                      <div className="pre_booking_items__time">
                        <span>{convertToTime(booking.booking_start_date)} - {convertToTime(booking.booking_end_date)}</span>
                      </div>
                      <div className="pre_booking_items__name">
                        <span>{booking.email}</span>
                      </div>
                    </div>
                  </div>
              ))}
          </div>
      </div>
  );
}

export default Prebooking;