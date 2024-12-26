import { format } from "date-fns";
import { webApi } from "../api";

export const getBookingsByDate = async (booking_id, date) =>{
    const queryParams = {
        product_id: booking_id,
        booking_start_date: format(date, 'yyyy-MM-dd'),
        booking_end_date: format(date, 'yyyy-MM-dd'),
        booking_status: 'pending',
      }
      const res = await webApi.getBookings(queryParams);
      if (res.data.data.length == 0) {
        return [];
      }
    return res.data.data.bookings;
}