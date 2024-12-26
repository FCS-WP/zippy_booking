import { Container } from "@mui/material";
import React, { useEffect } from "react";

const BookingStep3 = ({ selectedProduct, bookingData,handleNextStep }) => {
  const backToHome = () => {
    window.location.href = window.location.origin;
  }

  const newAppointment = () => {
    handleNextStep(3, null)
  } 

  useEffect(() => {

  }, []);

  return (
    <div className="booking-step-3">
      {bookingData && selectedProduct && (
        <div>
          <h3>Booking Details</h3>
          <div className="summary-container">
            <ul>
              <li>
                <div className="summary-item">
                  <span>Booking Id:</span>
                  <h4>{bookingData.booking_id}</h4>
                </div>
              </li>
              <li>
                <div className="summary-item">
                  <span>Booking Status:</span>
                  <h4>{bookingData.booking_status}</h4>
                </div>
              </li>
              <li>
                <div className="summary-item">
                  <span>Booking Start Date:</span>
                  <h4>{bookingData.booking_start_date}</h4>
                </div>
              </li>
              <li>
                <div className="summary-item">
                  <span>Booking End Date:</span>
                  <h4>{bookingData.booking_end_date}</h4>
                </div>
              </li>
              <li>
                <div className="summary-item">
                  <span>Field:</span>
                  <h4>{selectedProduct.product_name}</h4>
                </div>
              </li>
              <li>
                <div className="summary-item">
                  <span>Price:</span>
                  <h4>$ {selectedProduct.product_price}</h4>
                </div>
              </li>
            </ul>
          </div>
          <div className="btn-container">
          <span
            role="button"
            onClick={() => backToHome()}
            className="prev-step-btn"
          >
            Back To Home
          </span>
          <span
            role="button"
            onClick={() => newAppointment()}
            className="next-step-btn"
            id="next-step-btn"
          >
            Make New Appointment
          </span>
        </div>
        </div>
      )}
    </div>
  );
};

export default BookingStep3;
