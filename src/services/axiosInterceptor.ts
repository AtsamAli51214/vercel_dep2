import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { authService } from "@/services";

const backendUrl = import.meta.env.VITE_API_BASE_URL;

const axiosInterceptor: AxiosInstance = axios.create({
  baseURL: `${backendUrl}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInterceptor.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userInfo = authService.getUserInfo();
    const token = userInfo?.token;

    if (token && !authService.isTokenExpired(token)) {
      if (config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } else if (token && authService.isTokenExpired(token)) {
      authService.logout();
      return Promise.reject(new Error("Token expired"));
    }

    config.headers["Accept-Language"] =
      localStorage.getItem("locale") || "nl";
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInterceptor.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
    }
    return Promise.reject(error);
  },
);

export default axiosInterceptor;
