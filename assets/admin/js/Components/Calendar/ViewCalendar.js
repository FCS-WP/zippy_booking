import React, { useEffect, useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";


import { Bookings } from "../../api/bookings";
import { format } from "date-fns";
import { toast } from "react-toastify";
import EventView from "./EventView";
import theme from "../../../theme/theme";
import EditEventView from "./EditEventView";
import { getEventColors } from "../../utils/bookingHelper";
import { Box } from "@mui/material";

const ViewCalendar = ({ configs }) => {
  const [events, setEvents] = useState([]);
  const duration = configs?.duration ?? 60;
  const [scheduleTimes, setScheduleTimes] = useState()

  const convertBookingsToEvents = (bookings = []) => {
  
    const results = bookings.map((booking, item) => {
      const newEvent = {
        event_id: booking.ID,
        title: `Booking ${booking.ID}`,
        start: new Date(
          `${booking.booking_start_date} ${booking.booking_start_time}`
        ),
        end: new Date(
          `${booking.booking_end_date} ${booking.booking_end_time}`
        ),
        booking_data: booking,
        draggable: false,
        color: getEventColors(booking.booking_status),
      };
      return newEvent;
    });
    return results;
  };

  const getEventsByTime = async (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const params = {
      booking_start_date: format(startDate, "yyyy-MM-dd"),
      booking_end_date: format(endDate, "yyyy-MM-dd"),
    };

    const { data: response } = await Bookings.getBookings(params);
    if (response.status !== "success") {
      toast.error("Get bookings failed");
    }
    const newEvents = convertBookingsToEvents(response.data.bookings);
    setEvents(newEvents);
  };

  const getScheduleEvent = (props) => {
    const { start, end, view } = props;
    setScheduleTimes(props);
    getEventsByTime(start, end);
  };  

  return (
    <Box className="custom-calendar custom-mui">
      <Scheduler
        view="month"
        events={events}
        customViewer={(event, close) => (
          <EventView event={event} close={close} />
        )}
        week={{
          weekDays: [0, 1, 2, 3, 4, 5],
          weekStartOn: 6,
          startHour: 0,
          endHour: 24,
          step: duration,
          navigation: true,
          disableGoToDay: false,
        }}
        day={{
          startHour: 0,
          endHour: 24,
          step: 60,
          navigation: true,
        }}
        editable={true}
        customEditor={(scheduler) => <EditEventView scheduler={scheduler} />}
        getRemoteEvents={getScheduleEvent}
      />
    </Box>
  );
};

export default ViewCalendar;
