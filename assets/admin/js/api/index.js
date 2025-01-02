import { makeRequest } from "./axios";
export const Api = {
  async checkKeyExits(params) {
    return await makeRequest("/check_option", params);
  },
  async updateSettings(params) {
    return await makeRequest("/update_settings", params, "POST");
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
    return await makeRequest("/support-booking/products", params, "DELETE");
  },
};
