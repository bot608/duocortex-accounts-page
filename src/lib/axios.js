import axios from "axios";

// Use the same backend URL as the mobile app
const BACKEND_URL = "http://localhost:4000/";

// Endpoints matching the React Native app exactly
export const endpoints = {
  login: "auth/login",
  register: "auth/register",
  verifyOtp: "auth/verify-otp",
  profileUpdate: "user/update",
  getProfile: "user/user-details",
  requestWithdrawal: "user/request-withdrawal",
  // Payment endpoints
  createOrder: "api/create-order",
  getOrderStatus: "api/get-order-status",
  // Transaction history
  quizHistory: "quizzes/history",
};

// Create axios instance for API calls
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
});

// Request interceptor to add token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
