import React, { useEffect, useState } from "react";
import BookingStep1 from "./components/single-booking/BookingStep1";
import BookingStep2 from "./components/single-booking/BookingStep2";
import BookingStep3 from "./components/single-booking/BookingStep3";
import { webApi } from "./api";
import { toast, ToastContainer } from "react-toastify";
import Message from "./components/single-booking/Message";

const BookingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bookingData, setBookingData] = useState();
  const [pluginConfigs, setPluginConfigs] = useState();

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const getPluginConfigs = async () => {
    const getConfigs = await webApi.getConfigs();
    if (!getConfigs) {
      toast.error("Booking settings not found!");
      return false;
    }
    if (getConfigs.data.status == "success") {
      setPluginConfigs(getConfigs.data.data);
    }
  };

  const handleNextStep = (currentStep, data) => {
    switch (currentStep) {
      case 1:
        setSelectedProduct(data);
        setCurrentStep(2);
        break;
      case 2:
        setBookingData(data);
        setCurrentStep(3);
        break;
      case 3:
        setCurrentStep(1);
        setSelectedProduct(null);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    getPluginConfigs();
  }, []);

  return (
    <> 
      {pluginConfigs ? (
        <div id="zippy-booking-form">
        <div className="steps-container">
          <div className={`step-item ${currentStep == 1 ? "active" : ""}`}>
            <span></span>
            <h4>1. Select Field</h4>
          </div>
          <div className={`step-item ${currentStep == 2 ? "active" : ""}`}>
            <span></span>
            <h4>2. Select Date</h4>
          </div>
          <div className={`step-item ${currentStep == 3 ? "active" : ""}`}>
            <span></span>
            <h4>3. Review</h4>
          </div>
        </div>
        <div className="booking-container">
          {currentStep == 1 && <BookingStep1 handleNextStep={handleNextStep} />}
  
          {currentStep == 2 && (
            <BookingStep2
              handlePreviousStep={handlePreviousStep}
              handleNextStep={handleNextStep}
              selectedProduct={selectedProduct}
              configs={pluginConfigs}
            />
          )}
  
          {currentStep == 3 && (
            <BookingStep3
              selectedProduct={selectedProduct}
              bookingData={bookingData}
              handleNextStep={handleNextStep}
            />
          )}
        </div>
        <ToastContainer />
      </div>
      ) : (
        <Message message={"Can not get booking configs."} />
      )}
    </>
    
  );
};

export default BookingForm;
