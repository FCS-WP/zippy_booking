import React, { useState, useEffect } from "react";
import { getCustomDayOfWeek } from "../helper/datetime";
import {
  parse,
  format,
  addMinutes,
  isBefore,
  isEqual,
  isAfter,
} from "date-fns";
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

  const [timeActive, setTimeActive] = useState();
  const [timeSeleted, setTimeSeleted] = useState();

  const handleTimeSelect = (time, index) => {
    setTimeActive(index);
    handleTimeSelected(time);
  };
  useEffect(() => {
    return;
  }, [selectedDate]);

  function filterTimeSlots(selectedDate, duration, bookingInfo) {
    const date = getCustomDayOfWeek(selectedDate);
    const configTime = workingTimeByWeekday[date];

    return getAvailableTimeSlots(configTime, duration, bookingInfo);
  }

  function getAvailableTimeSlots(configTime, duration, bookings = []) {
    const { open_at, close_at } = configTime;

    const parseTime = (timeStr) => parse(timeStr, "HH:mm", new Date());

    const formatTime = (time) => format(time, "HH:mm");

    const startTime = parseTime(open_at);
    const endTime = parseTime(close_at);
    const availableTimeSlots = [];

    // Convert bookings to date objects
    const bookingIntervals = bookings.map((booking) => ({
      start: parseTime(booking.booking_start_time),
      end: parseTime(booking.booking_end_time),
    }));

    // Generate time slots
    let currentTime = startTime;
    while (
      isBefore(currentTime, endTime) &&
      isBefore(addMinutes(currentTime, duration), endTime)
    ) {
      const slotEnd = addMinutes(currentTime, duration);

      // Check if the slot overlaps with any booking
      const isOverlapping = bookingIntervals.some(
        (booking) =>
          (isBefore(currentTime, booking.end) &&
            isAfter(slotEnd, booking.start)) ||
          isEqual(currentTime, booking.start) ||
          isEqual(slotEnd, booking.end)
      );

      // Add the slot only if it doesn't overlap
      if (!isOverlapping) {
        availableTimeSlots.push({
          start: formatTime(currentTime),
          end: formatTime(slotEnd),
        });
      }

      currentTime = addMinutes(currentTime, duration);
    }

    return availableTimeSlots;
  }

  const slots = filterTimeSlots(selectedDate, duration, bookingInfo);

  return (
    <div>
      <h4>Time Slots</h4>
      <div className="slots-container">
        {slots &&
          slots.map((slot, index) => (
            <div
              key={index}
              role="button"
              onClick={() => handleTimeSelect(slot, index)}
              className={`slot-item ${timeActive == index ? "active" : ""}`}
            >
              <span>
                {slot.start} - {slot.end}
              </span>
            </div>
          ))}
        {slots.length == 0 && (
          <div>
            The date you selected is fully booked. Please choose another date.
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingTimeSlot;
