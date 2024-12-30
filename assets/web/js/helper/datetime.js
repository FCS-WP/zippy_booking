import { format } from "date-fns";

export const generateTimeSlots = (startTime, endTime, gapTime) => {
  const timeSlots = [];

  let current = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);

  while (current < end) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current);
    slotEnd.setMinutes(slotEnd.getMinutes() + parseInt(gapTime));

    if (slotEnd > end) break;

    timeSlots.push({
      start: slotStart.toTimeString().slice(0, 5),
      end: slotEnd.toTimeString().slice(0, 5),
    });

    current.setMinutes(current.getMinutes() + parseInt(gapTime));
  }
  return timeSlots;
};

export const getTimeFromBooking = (booking) => {
  const start_date = new Date(booking.booking_start_date);
  const end_date = new Date(booking.booking_end_date);

  return { start: format(start_date, "HH:mm"), end: format(end_date, "HH:mm") };
};

export const filterTimeSlots = (
  timeSlots = [],
  date = new Date(),
  bookingList = []
) => {
  const targetDate = format(date, "yyyy-MM-dd");

  const getSameBookingDate = bookingList.filter((booking) => {
    const datePart = booking.booking_start_date.split(" ")[0];
    return datePart === targetDate;
  });

  if (getSameBookingDate.length == 0) {
    return timeSlots;
  }

  const excludeSlots = [];
  getSameBookingDate.map((booking, index) => {
    const slot = getTimeFromBooking(booking);
    excludeSlots.push(slot);
  });

  const newTimeSlots = timeSlots.filter((item) => {
    return !excludeSlots.find(
      (slot) => slot.start == item.start && slot.end == item.end
    );
  });

  return newTimeSlots;
};

export const isWorkingDate = (date, checkArr = []) => {
  const day = date.getDay();
  return checkArr.includes(day);
};

export const getBookingTime = (time) => {
  const date = new Date(time);
  return format(date, "HH:mm aa");
};

export const getBookingDate = (time) => {
  const date = new Date(time);
  return format(date, "yyyy-MM-dd");
};

export const isInFilterDates = (bookingStart, start, end) => {
  if (!start) {
    return false;
  }
  const filterDate = new Date(bookingStart);
  let startDate = new Date(start);
  let endDate = new Date(end);
  startDate.setHours(0, 0, 0);
  endDate.setHours(0, 0, 0);

  if (startDate.getTime() <= filterDate.getTime()) {
    if (!end) {
      return true;
    }
    if (end && filterDate.getTime() <= endDate.getTime()) {
      return true;
    }
  }
  return false;
};
