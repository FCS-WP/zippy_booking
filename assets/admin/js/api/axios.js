import axios from "axios";

export const makeRequest = async (
  endpoint,
  params = {},
  method = "",
  token = "FEhI30q7ySHtMfzvSDo6RkxZUDVaQ1BBU3lBcGhYS3BrQStIUT09"
) => {
  const baseURL = "/wp-json";
  const api = axios.create({
    baseURL: baseURL,
  });

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const config = {
    url: "zippy-booking/v1" + endpoint,
    params: params,
    method: method,
    headers: headers,
  };

  try {
    const res = await api.request(config);
    const data = res.data;
    // console.log(error);

    return { data };
  } catch (error) {
    if (!error?.response) {
      console.error("❗Error", error.message);
      return { error: error.message };
    }

    console.error("API Error:", error.response.statusText);
    return { error: error.response.statusText };
  }
};
