import React, { useState, useEffect } from "react";
import { getCustomDayOfWeek, getAvailableTimeSlots } from "../helper/datetime";
import Message from "./single-booking/Message";
const BookingTimeSlot = ({
  config,
  bookingInfo,
  selectedDate,
  handleTimeSelected,
}) => {
  const workingTimeByWeekday = config.store_working_time.reduce((acc, time) => {
    acc[time.weekday] = time;
    return acc;
  }, {});

  const duration = config.duration;

  const [timeActive, setTimeActive] = useState(null);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (selectedDate) {
      const date = getCustomDayOfWeek(selectedDate);
      const configTime = workingTimeByWeekday[date];
      const timeSlots = getAvailableTimeSlots(
        configTime,
        duration,
        bookingInfo
      );
      setSlots(timeSlots);
    }
  }, [selectedDate, duration, bookingInfo]);

  const handleTimeSelect = (slot, index) => {
    if (slot.isDisabled) return; // Prevent selecting disabled slots
    setTimeActive(index);
    handleTimeSelected(slot);
  };

  return (
    <div>
      <h4>Time Slots</h4>
      <div className="slots-container">
        {slots.length > 0 ? (
          slots.map((slot, index) => (
            <div
              key={index}
              role="button"
              aria-disabled={slot.isDisabled}
              onClick={() => handleTimeSelect(slot, index)}
              className={`slot-item ${timeActive === index ? "active" : ""} ${
                slot.isDisabled ? "disabled" : ""
              }`}
            >
              <span>
                {slot.start} - {slot.end}
              </span>
            </div>
          ))
        ) : (
          <Message
            message={
              " The date you selected is fully booked. Please choose another date."
            }
            className="no-slots-message"
          />
        )}
      </div>
    </div>
  );
};

export default BookingTimeSlot;
