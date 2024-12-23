import React, { useState } from 'react';

function Prebooking() {
  const [startDate, setStartDate] = useState(new Date());
    
      return (
        <div>
            <h6>Pre-order Schedule</h6>
            <div class="row-booking">
                <div class="col_booking_time">
                    <div class="pre_booking_items">
                        <div class="pre_booking_items__time">
                            <span>09:00 AM - 10:00 AM</span>
                        </div>
                        <div class="pre_booking_items__name">
                            <span>Customer #0348</span>
                        </div>
                    </div>
                </div>
                <div class="col_booking_time">
                    <div class="pre_booking_items">
                        <div class="pre_booking_items__time">
                            <span>11:00 AM - 12:00 AM</span>
                        </div>
                        <div class="pre_booking_items__name">
                            <span>Customer #0331</span>
                        </div>
                    </div>
                </div>
                <div class="col_booking_time">
                    <div class="pre_booking_items">
                        <div class="pre_booking_items__time">
                            <span>01:00 PM - 02:00 PM</span>
                        </div>
                        <div class="pre_booking_items__name">
                            <span>Customer #0329</span>
                        </div>
                    </div>
                </div>
                <div class="col_booking_time">
                    <div class="pre_booking_items">
                        <div class="pre_booking_items__time">
                            <span>06:00 PM - 07:00 PM</span>
                        </div>
                        <div class="pre_booking_items__name">
                            <span>Customer #0312</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
    
}

export default Prebooking;