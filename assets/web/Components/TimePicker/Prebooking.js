import React, { useEffect, useState } from "react";
import dataBooking from "../../js/json/booking_list.json";
import { useDateContext } from '../Booking/DateContext';

function Prebooking() {
    const { selectedDate } = useDateContext();

    const isMatchingDate = (selectedDate, targetDate) => {

      const selectedDateObj = new Date(selectedDate);
    
      const selectedDateFormatted = selectedDateObj.toISOString().split("T")[0];
      return selectedDateFormatted === targetDate;
    };
    
      if (dataBooking.status === "success") {
        return (
          <div>
            <h6>Pre-order Schedule</h6>
            <div className="row-booking">
              {dataBooking.data.booking.map((item) => {
                if(isMatchingDate(selectedDate, item.start_date)){
                    return (
                        <div className="col_booking_time" key={item.ID}>
                          <div className="pre_booking_items">
                            <div className="pre_booking_items__time">
                              <span>{item.start_time} - {item.end_time}</span>
                            </div>
                            <div className="pre_booking_items__name">
                              <span>Customer #{item.user_id}</span>
                            </div>
                          </div>
                        </div>
                      );   
                }
              })}
              
            </div>
          </div>
          
        );
      }
    
}

export default Prebooking;