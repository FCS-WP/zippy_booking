import axios from "axios";

export const webApi = {
  async getCategories(params) {
    return await makeRequest("/wc-analytics/products/categories", params);
  },
};
