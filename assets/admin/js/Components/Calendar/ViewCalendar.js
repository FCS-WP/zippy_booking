import React, { useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid2,
  Stack,
  Typography,
} from "@mui/material";
import StatusSelect from "../StatusSelect";
import { Bookings } from "../../api/bookings";
import { format } from "date-fns";
import { toast } from "react-toastify";

const ViewCalendar = ({ configs }) => {
  const [events, setEvents] = useState([]);
  const duration = configs?.duration ?? 60;

  const CustomView = ({ event, close, setEvents }) => {
    const booking = event?.booking_data;
    const [isStatusLoading, setIsStatusLoading] = useState(false);
    const handleStatusChange = (bookingID, newStatus) => {
      updateBookingStatus(bookingID, newStatus);
    };

    const updateBookingStatus = async (bookingID, newStatus) => {
      setIsStatusLoading(true);
      try {
        const params = { booking_id: bookingID, booking_status: newStatus };
        const response = await Bookings.updateBooking(params);

        if (response.data.status === "success") {
          setEvents((prevData) =>
            prevData.map((event) =>
              event.booking === bookingID
                ? (event.booking.booking_status = newStatus)
                : event
            )
          );
          toast.success(`Booking has been updated to ${newStatus}`);
        }
      } catch (error) {
        toast.error("This booking cannot be updated");
      } finally {
        setIsStatusLoading(false);
      }
    };

    return (
      <Box p={3} className="booking-informations">
        <Grid2 container spacing={2}>
          <Grid2>
            <Typography variant="h2">Booking ID: {booking.ID}</Typography>
            <Typography variant="span" fontSize={13}>
              Created at: {booking?.created_at ?? ""}
            </Typography>
          </Grid2>
        </Grid2>
        <Grid2 container my={3} spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Typography fontWeight={600}>Price:</Typography>
            <Typography variant="h6" fontSize={16}>
              $ {booking?.order?.order_total ?? ""}
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Typography fontWeight={600}>Booking Email:</Typography>
            <Typography variant="h6" fontSize={16}>
              {booking?.email ?? ""}
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Typography fontWeight={600}>Booking Start Date:</Typography>
            <Typography variant="h6" fontSize={16}>
              {`${booking.booking_start_date} ${booking.booking_start_time}`}
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Typography fontWeight={600}>Booking End Date:</Typography>
            <Typography variant="h6" fontSize={16}>
              {`${booking.booking_end_date} ${booking.booking_end_time}`}
            </Typography>
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <Typography fontWeight={600}>Status:</Typography>
            <StatusSelect
              currentStatus={booking?.booking_status ?? "pending"}
              isLoading={isStatusLoading}
              onStatusChange={(newStatus) => {
                handleStatusChange(booking.ID, newStatus);
              }}
            />
          </Grid2>
        </Grid2>

        <Divider />
        {/* Action box */}
        <Box mt={3} display={"flex"} justifyContent={"end"}>
          <Button
            onClick={close}
            variant="outlined"
            color="success"
            sx={{
              px: 3,
              color: "#4A8875",
              borderColor: "#4A8875",
              ":hover": { background: "#4A8875", color: "#FFF" },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    );
  };

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
    getEventsByTime(start, end);
  };

  return (
    <div className="custom-calendar custom-mui">
      <Scheduler
        view="month"
        events={events}
        customViewer={(event, close) => (
          <CustomView event={event} close={close} setEvents={setEvents} />
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
        editable={false}
        getRemoteEvents={getScheduleEvent}
      />
    </div>
  );
};

export default ViewCalendar;
