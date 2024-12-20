import { makeRequest } from "./axios";
export const Api = {
  async getCategories(params) {
    return await makeRequest("/wc-analytics/products/categories", params);
  },
};

export const wooAuthentication = async (
  endpoint,
  params = {},
  method = "GET"
) => {
  const baseURL = "/wc-auth/v1/authorize";
  const api = axios.create({
    baseURL: baseURL,
  });

  const config = {
    url: endpoint,
    params: params,
    method: method,
  };
  try {
    let res = null;

    res = await api.request(config);
    const data = res.data;
    return { data };
  } catch {
    (error) => {
      if (!error?.response) {
        console.error("❗Error", error.message);
        return { ...error, catchedError: error };
      }

      console.error(error.response.statusText);
      return error;
    };
  }
};
