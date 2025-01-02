import React, { useEffect, useState } from "react";
import Calendar from "./components/popup-booking/calendar/calendar";
import Timepicker from "./components/popup-booking/timepicker/timepicker";
import Prebooking from "./components/popup-booking/pre-booking/prebooking";
import { webApi } from "./api";
import { alertInputEmail, showAlert } from "./helper/showAlert";

function BookingPopUp() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedStartTime, setSelectedStartTime] = useState(null);
    const [selectedEndTime, setSelectedEndTime] = useState(null);
    const [productId, setProductId] = useState(null);

    const openPopup = () => {
      setIsPopupOpen(true);
    };
  
    const closePopup = () => {
      setIsPopupOpen(false);
    };
  
    const handleChooseDate = (date) => {
      setSelectedDate(date);
    };
  
    const handleStartTimeSelect = (time) => {
      setSelectedStartTime(time);
    };
  
    const handleEndTimeSelect = (time) => {
      setSelectedEndTime(time);
    };

    useEffect(() => {
      const btnBooking = document.getElementById("btn_booking");
      const productid = btnBooking?.dataset.idProduct; 
      setProductId(productid);
    }, []);
    
    const formatDate = (dateString) => {
      const dateObject = new Date(dateString);
      const year = dateObject.getFullYear();
      const month = String(dateObject.getMonth() + 1).padStart(2, "0");
      const day = String(dateObject.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const convertToTime = (dateString) => {
      const dateObject = new Date(dateString);
      const hours = String(dateObject.getHours()).padStart(2, "0");
      const minutes = String(dateObject.getMinutes()).padStart(2, "0");
      const seconds = String(dateObject.getSeconds()).padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    };

    const createBooking = async () =>{
      try {

        let email = admin_data.user_email;
        if (!email) {
            email = await alertInputEmail();
            if (!email) {
                showAlert("warning", "Canceled", "You did not enter a valid email or canceled the booking.");
                return;
            }
        }else{
          const params = {
            product_id: productId,
            user_id: admin_data.userID,
            email: admin_data.user_email,
            booking_start_date: formatDate(selectedDate) + " " + convertToTime(selectedStartTime),
            booking_end_date: formatDate(selectedDate) + " " + convertToTime(selectedEndTime),
          };
  
          const newBookings = await webApi.createBooking(params); 
  
          showAlert("success", "Booking Successful", "Your booking has been created successfully!");
          console.log("Booking created with params:", params);
        }
      } catch (err) {
        showAlert("error", "Booking Failed", err.message || "An unknown error occurred.");
      } 
    }

    const getAllBooking = async () =>{
      try {
        const params = {
          product_id: productId,
          booking_start_date: formatDate(selectedDate),
          booking_end_date: formatDate(selectedDate),
      };
        const bookings = await webApi.getBookings(params);
        console.log("Bookings:", bookings);
      }catch(err){
        showAlert("error", "Get Booking Failed", err.message || "An unknown error occurred.");
      }
    }

    return (
      <>
        <button className="booking_popup_form" onClick={openPopup}>Booking</button>
  
        {isPopupOpen && (
          <div className="box_pop_up">
            <div className="box_pop_up--content">
              <h2>Booking Form</h2>
              <p>Select a time for Pottery Painting Session</p>
              <p>
                Do note that the studio fee ($28 per person, collected during
                booking of session as a deposit) excludes the price of chosen
                ceramic piece. The studio fee is inclusive of studio and tools
                usage and pottery processing (firing done by Pottery Please)
              </p>
              <div className="row_booking">
                <div className="col_booking_5">
                  <Calendar onDateSelect={handleChooseDate} />
                </div>
                <div className="col_booking_5">
                  <Timepicker
                    onStartTimeSelect={handleStartTimeSelect}
                    onEndTimeSelect={handleEndTimeSelect}
                  />
                  <Prebooking/>
                </div>
              </div>
              <div className="flex-space-between">
                <button onClick={closePopup}>Cancel</button>
                <button
                  onClick={() => {
                    createBooking(); 
                    getAllBooking();
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
  
  export default BookingPopUp;