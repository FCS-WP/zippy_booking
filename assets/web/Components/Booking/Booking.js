import React from "react";
import { useState } from "react";
import Calendar from "../Calendar/Calendar";
import Timepicker from "../TimePicker/Timepicker";
import Prebooking from "../TimePicker/Prebooking";
import BookingButton from "../Action/addBooking";
import { DateProvider } from './DateContext';
import { TimeProvider } from "../TimePicker/TimeContext";

function Booking() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  const openPopup = () => {
    setIsPopupOpen(true); 
  };

  const closePopup = () => {
    setIsPopupOpen(false); 
  };

  
    return (    
      <>
        <div>
          <button onClick={openPopup}>Open Pop-Up</button>

          {isPopupOpen && (
            <div className="box_pop_up">
              <div className="box_pop_up--content">
                <h2>Booing Form</h2>
                <p>Select a time for Pottery Painting Session</p>
                <p>Do note tha the studio fee ($28 per person, collected during booking of session as a deposit) excludes the price of chosen ceramic piece. The studio fee is inclusive of studio and tools usage and pottery processing (firing done by Pottery Please)</p>
                <DateProvider>
                <TimeProvider>
                  <div className="row_booking">
                    <div class="col_booking_5">
                      <Calendar/>
                    </div>
                    <div className="col_booking_5">
                    
                        <Timepicker/>
                        <Prebooking/>
                      
                    </div>
                  </div>
                  
                <div className="flex-space-between">
                    <button onClick={closePopup}>Cancel</button>
                    <BookingButton/>
                  </div>
                  </TimeProvider>
                  </DateProvider>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  export default Booking;