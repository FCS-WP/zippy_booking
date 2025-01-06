import { makeRequest } from "./axios";
export const Api = {
  async checkKeyExits(params) {
    return await makeRequest("/check_option", params);
  },
  async createSettings(params) {
    return await makeRequest("/configs", params, "POST");
  },
  async updateSettings(params) {
    return await makeRequest("/configs", params, "PUT");
  },
  async getSettings(params) {
    return await makeRequest("/configs", params, "GET");
  },
  async searchByKeyword(params) {
    return await makeRequest("/prodegories", params);
  },
  async addSupportCategories(params) {
    return await makeRequest("/support-booking/categories", params, "POST");
  },
  async addSupportProducts(params) {
    return await makeRequest("/support-booking/products", params, "POST");
  },
  async getMappingData(params) {
    return await makeRequest("/support-booking", params);
  },
  async deleteMappingItems(params) {
    return await makeRequest("/support-booking/delete", params, "DELETE");
  },
};
