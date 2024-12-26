import { makeRequest } from "../axios";

export const Bookings = {
  async getBookings(params) {
    return await makeRequest("/bookings", params);
  },
};
