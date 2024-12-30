import axios from "axios";
import { makeLocalRequest, makeRequest, makeWooRequest } from "./axios";

export const webApi = {
  async getCategories(params) {
    return await makeRequest("/wc-analytics/products/categories", params);
  },

  async getBookings (params) {
    return await makeRequest("/bookings", params);
  },

  async createBooking (params) {
    return await makeRequest("/booking", params, 'POST');
  },

  async getConfigs (params) {
    return await makeRequest("/configs", params);
  },

  async getSupportCategories (params) {
    return await makeRequest("/support-booking/categories", params);
  },


  // async getWooCategories (params) {
  //   return await makeLocalRequest("/wc/v3/products/categories", params);
  // },
  // async getWooProductsByCategoryID (params) {
  //   return await makeLocalRequest('/wc/v3/products', params);
  // }

};


// export const webApiBookingSingleProducts = {
//   async getBookings(params) {
//     return await makeRequest("/bookings", params);
//   },


// };