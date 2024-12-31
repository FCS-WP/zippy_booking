import { makeRequest } from "../axios";

export const Bookings = {
  async getBookings(params) {
    return await makeRequest("/bookings", params , "GET" , "TNi+FEhI30q7ySHtMfzvSDo6RkxZUDVaQ1BBU3lBcGhYS3BrQStIUT09");
  },

  async updateBooking(params) {
    return await makeRequest("/update-booking", params , "PUT" , "TNi+FEhI30q7ySHtMfzvSDo6RkxZUDVaQ1BBU3lBcGhYS3BrQStIUT09");
  },
};
