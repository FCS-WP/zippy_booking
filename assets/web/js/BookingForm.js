import React, { useEffect, useState } from "react";
import BookingStep1 from "./components/BookingStep1";
import BookingStep2 from "./components/BookingStep2";
import BookingStep3 from "./components/BookingStep3";

const BookingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bookingData, setBookingData] = useState();

  const handlePreviousStep = () => {
    setCurrentStep(1);
  }

  const handleNextStep = (currentStep, data) => {
    switch (currentStep) {
      case 1:
        setSelectedProduct(data.product);
        setCurrentStep(2);
        break;
      case 2:
        setBookingData(data);
        setCurrentStep(3);
        break;
      case 3:
        
        break;
      default:
        break;
    }
    
   
    // handle api here

    // Go to next step

  }
  

  return (
    <div id="zippy-booking-form">
      <div className="steps-container" >
        <div className={`step-item ${currentStep == 1 ? 'active' : ''}`}>
          <span></span>
          <h4>1. Select Field</h4>
        </div>
        <div className={`step-item ${currentStep == 2 ? 'active' : ''}`}>
          <span></span>
          <h4>2. Select Date</h4>
        </div>
        <div className={`step-item ${currentStep == 3 ? 'active' : ''}`}>
          <span></span>
          <h4>3. Review Booking</h4>
        </div>
      </div>
      <div className="booking-container">
        {(currentStep == 1) && (
          <BookingStep1 handleNextStep={handleNextStep} />
        )}

        {(currentStep == 2) && (
          <BookingStep2 
            handlePreviousStep={handlePreviousStep} 
            handleNextStep={handleNextStep} 
            selectedProduct={selectedProduct}
          />
        )}
        {(currentStep == 3) && (
          <BookingStep3 />
        )}
      </div>
    </div>
  );
};

export default BookingForm;
