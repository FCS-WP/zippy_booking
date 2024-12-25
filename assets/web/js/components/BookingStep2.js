import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { convertDateTime } from "../helper/datetime";
import { webApi } from "../api";
import Swal from "sweetalert2";
import { showAlert } from "../helper/showAlert";

const BookingStep2 = ({ handleNextStep, handlePreviousStep, selectedProduct }) => {
    const [timeSlots, setTimeSlots] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTimes, setSelectedTimes] = useState();
    const [timeActive, setTimeActive] = useState();

    const slots = [
        {id: 1, start_time: '10:00', end_time: '11:00', status: 1 },
        {id: 2, start_time: '11:00', end_time: '12:00', status: 1 },
        {id: 3, start_time: '12:00', end_time: '13:00', status: 1 },
        {id: 4, start_time: '13:00', end_time: '14:00', status: 1 },
        {id: 5, start_time: '16:00', end_time: '17:00', status: 1 },
    ];

    const handleSelectDate = (date) => {
        setSelectedDate(date)
    }

    const handleSelectTime = (slot, index) => {
        setSelectedTimes(slot);
        setTimeActive(index);
        convertDateTime(selectedDate, slot)
    }

    const handleSubmitStep2 = async () => {
        if (!selectedTimes) {
            console.log('select available time pls');
        }

        const data = {
            // product_id : selectedProduct.id,
            product_id: 72,
            email: "demobooking@zippy.com",
            booking_start_date: "2024-12-20 13:00",
            booking_end_date: "2024-12-20 14:00"
        }

        const createBooking = await webApi.createBooking(data);
        createBooking ? showAlert('success') : showAlert('error');

        handleNextStep(2, createBooking.data)
    }

  return (
    <>
      {selectedProduct && (
        <div className="booking-step-2">
            <div className="product-info">
                <div>
                    <h4>Field</h4>
                    <span> {selectedProduct.name}</span>
                </div>
                <div>
                    <h4>Price</h4>
                    <span> ${selectedProduct.price}</span>
                </div>

            </div>
        <div className="booking-section">
            <div className="booking-calendar">
                <h4>Date & Time</h4>
                <div className="date-box">
                    <DatePicker 
                        minDate={new Date()}
                        selected={selectedDate}
                        onChange={(date) => handleSelectDate(date)}
                        inline
                    />
                </div>
            </div>
            <div className="time-slots">
                <h4>Time Slots</h4>
                <div className="slots-container">
                    {slots && slots.map((times, index) => (
                        <div 
                        key={index} 
                        role="button" 
                        onClick={()=>handleSelectTime(times, index)} 
                        className={`slot-item ${timeActive == index ? 'active' : ''}`}
                        >
                            <span>{times.start_time} am - {times.end_time} am</span>
                        </div>
                    ))}
                    {slots.length == 0 && (
                        <div>
                            The date you selected is fully booked. Please choose another date.
                        </div>
                    )}
                </div>
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
