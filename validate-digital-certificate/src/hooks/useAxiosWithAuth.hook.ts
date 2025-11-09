import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || "http://192.168.0.146:3001",
  // baseURL: API_BASE_URL || "http://localhost:3001",
  timeout: 15000,
});

// Interceptor to inject auth token from localStorage on every request
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const headers = (config.headers || {}) as any;
        // attach token as Bearer token
        headers["Authorization"] = `Bearer ${token}`;
        config.headers = headers;
      }
    } catch (e) {
      // ignore localStorage errors
      console.error("useAxiosWithAuth: failed reading token", e);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const useAxiosWithAuth = (): AxiosInstance => {
  return axiosInstance;
};

export default axiosInstance;
