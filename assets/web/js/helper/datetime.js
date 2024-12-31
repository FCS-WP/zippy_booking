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
      start: format(slotStart, 'HH:mm'),
      end:  format(slotEnd, 'HH:mm'),
    });

    current.setMinutes(current.getMinutes() + parseInt(gapTime));
  }
  return timeSlots;
};

export const getTimeFromBooking = (booking) => {
  const startDateString = booking.booking_start_date + 'T' + booking.booking_start_time;
  const endDateString = booking.booking_end_date + 'T' + booking.booking_end_time;

  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);

  return { start: format(startDate, 'HH:mm'), end: format(endDate, 'HH:mm') };
};

export const filterTimeSlots = (
  timeSlots = [],
  date = new Date(),
  bookingList = []
) => {

  const targetDate = format(date, "yyyy-MM-dd");

  const getSameBookingDate = bookingList.filter((booking) => {
    const datePart = new Date(booking.booking_start_date);
    return format(datePart, "yyyy-MM-dd") === targetDate;
  });

  if (getSameBookingDate.length == 0) {
    return timeSlots;
  }

  const excludeSlots = [];
  getSameBookingDate.map((booking) => {
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
  const current = new Date(`1970-01-01T${time}`);
  const date = new Date(current);
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
  let filterDate = new Date(bookingStart);
   
  let startDate = new Date(start);
  let endDate = new Date(end);
  filterDate.setHours(0, 0, 0);
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
