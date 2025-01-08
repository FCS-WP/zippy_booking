import { parse, format, addMinutes, isBefore, getDay, isAfter } from "date-fns";
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
      start: format(slotStart, "HH:mm"),
      end: format(slotEnd, "HH:mm"),
    });

    current.setMinutes(current.getMinutes() + parseInt(gapTime));
  }
  return timeSlots;
};

export const getTimeFromBooking = (booking) => {
  const startDateString =
    booking.booking_start_date + "T" + booking.booking_start_time;
  const endDateString =
    booking.booking_end_date + "T" + booking.booking_end_time;

  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);

  return { start: format(startDate, "HH:mm"), end: format(endDate, "HH:mm") };
};

export const getAvailableTimeSlots = (configTime, duration, bookings = []) => {
  const { open_at, close_at } = configTime;

  // Adjust parsing and formatting for HH:mm:ss format
  const parseTime = (timeStr) => parse(timeStr, "HH:mm:ss", new Date());
  const formatTime = (time) => format(time, "HH:mm:ss");

  const startTime = parseTime(open_at);
  const endTime = parseTime(close_at);
  const timeSlots = [];

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

    // Check if the slot overlaps or falls entirely within any booking
    const isExcluded = bookingIntervals.some(
      (booking) =>
        (isBefore(currentTime, booking.end) &&
          isAfter(slotEnd, booking.start)) ||
        (isAfter(currentTime, booking.start) && isBefore(slotEnd, booking.end))
    );

    // Add the slot with isDisabled key
    timeSlots.push({
      start: formatTime(currentTime),
      end: formatTime(slotEnd),
      isDisabled: isExcluded,
    });

    currentTime = addMinutes(currentTime, duration);
  }

  return timeSlots;
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

export const getCustomDayOfWeek = (date) => {
  const inputDate = new Date(date);
  return  inputDate.getDay();
};
