import React from "react";
import { useState } from "react";
import Calendar from "../Calendar/Calendar";
import Timepicker from "../TimePicker/Timepicker";
import Prebooking from "../TimePicker/Prebooking";
import { DateProvider } from './DateContext';

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
            <div class="box_pop_up">
              <div class="box_pop_up--content">
                <h2>Booing Form</h2>
                <p>Select a time for Pottery Painting Session</p>
                <p>Do note tha the studio fee ($28 per person, collected during booking of session as a deposit) excludes the price of chosen ceramic piece. The studio fee is inclusive of studio and tools usage and pottery processing (firing done by Pottery Please)</p>
                <DateProvider>
                  <div class="row_booking">
                    <div class="col_booking_5">
                      <Calendar/>
                    </div>
                    <div class="col_booking_5">
                      
                        <Timepicker/>
                        <Prebooking/>
                      
                    </div>
                  </div>
                </DateProvider>
                <div class="flex-space-between">
                    <button>Cancel</button>
                    <button>Continute</button>
                  </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  export default Booking;