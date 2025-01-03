import { makeRequest } from "../axios";

export const Bookings = {
  async getBookings(params) {
    return await makeRequest("/bookings", params, "GET");
  },

  async updateBooking(params) {
    return await makeRequest("/update-booking", params, "PUT");
  },
};
