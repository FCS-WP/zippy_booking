import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { filterTimeSlots, generateTimeSlots, isWorkingDate } from "../../helper/datetime";
import { webApi } from "../../api";
import { showAlert } from "../../helper/showAlert";
import TimeSlots from "./TimeSlots";
import { format } from "date-fns";

const BookingStep2 = ({ handleNextStep, handlePreviousStep, selectedProduct, configs }) => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTimes, setSelectedTimes] = useState();
    const [workingDates, setWorkingDates] = useState([]);
    const [createdBookings, setCreatedBookings] = useState([]);

    const handleSelectDate = (date) => {
        setSelectedDate(date);
    }

    const getCreatedBookings = async () => {
      const res = await webApi.getBookings();
      const bookings = res.data.data.bookings;
      const pendingBookings = bookings.filter((booking) => booking.booking_status == 'pending' && booking.product_id == selectedProduct.product_id);
      setCreatedBookings(pendingBookings);
    }

    const handleLoadSlots = () => {
      const newTimeSlots = filterTimeSlots(timeSlots, selectedDate, createdBookings);
      setFilteredTimeSlots(newTimeSlots);
    }

    useEffect(() => {
      if (configs) {
          const singleConfig = configs.filter((config, index) => config.booking_type == 'single');
          const slots = generateTimeSlots(singleConfig[0].open_at, singleConfig[0].close_at, singleConfig[0].duration);
          setWorkingDates(singleConfig[0].weekdays);
          setTimeSlots(slots);
      }
    }, [configs])

    useEffect(()=>{
      getCreatedBookings();
    }, [])

    useEffect(()=>{
      handleLoadSlots();
    }, [timeSlots, createdBookings, selectedDate])

    const handleSubmitStep2 = async () => {
        if (!selectedTimes) {
          showAlert('warning', 'Missing Field','Please fill in all the required information.', 3000);
          return;
        }

        let bookingStartDateString = format(selectedDate, 'yyyy-MM-dd') + 'T' + selectedTimes.start;
        let bookingEndDateString = format(selectedDate, 'yyyy-MM-dd') + 'T' + selectedTimes.end;
        const bookingStartDate = new Date(bookingStartDateString);
        const bookingEndDate = new Date(bookingEndDateString);

        const data = {
            product_id: selectedProduct.product_id,
            email: "demobooking@zippy.com",
            booking_start_date: format(bookingStartDate, 'yyyy-MM-dd HH:mm'),
            booking_end_date: format(bookingEndDate, 'yyyy-MM-dd HH:mm'),
        }

        const createBooking = await webApi.createBooking(data);
        createBooking ? showAlert('success', 'Successfully','Booking has been created', 3000) : showAlert('error', 'Error!','Can not create booking. Try again please!', 3000);
        handleNextStep(2, createBooking.data.data);
    }

  return (
    <>
      {selectedProduct && (
        <div className="booking-step-2">
            <div className="product-info">
                <div>
                    <h4>Field</h4>
                    <span> {selectedProduct.product_name}</span>
                </div>
                <div>
                    <h4>Price</h4>
                    <span> ${selectedProduct.product_price}</span>
                </div>
            </div>
        <div className="booking-section">
            <div className="booking-calendar">
                <h4>Date & Time</h4>
                <div className="date-box">
                    <DatePicker 
                        minDate={new Date()}
                        selected={selectedDate}
                        filterDate={date => isWorkingDate(date, workingDates)}
                        onChange={(date) => handleSelectDate(date)}
                        inline
                    />
                </div>
            </div>
            <div className="time-slots">
              {filteredTimeSlots && (
                <TimeSlots 
                    slots={filteredTimeSlots}
                    onSelectTime={(time) => setSelectedTimes(time)}
                />
              )}
            </div>
        </div>
        <div className="btn-container">
          <span
            role="button"
            onClick={() => handlePreviousStep()}
            className="prev-step-btn"
          >
            Cancle
          </span>
          <span
            role="button"
            onClick={() => handleSubmitStep2()}
            className="next-step-btn"
            id="next-step-btn"
          >
            Continue
          </span>
        </div>
      </div>
      )}
    </>
  );
};

export default BookingStep2;
