import AsyncStorage from "@react-native-async-storage/async-storage"
import axios, { type AxiosRequestHeaders } from "axios"
// Use process.env.NODE_ENV for dev check

// API Configuration
export const API_BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000/api" : "https://your-production-api.com/api"

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Synchronous interceptor: get token from AsyncStorage synchronously if possible, else skip
    // For full async, use request in each API call instead
    if (!config.headers) config.headers = {} as AxiosRequestHeaders;
    // Optionally, you can set a static token here for dev/testing
    // config.headers.Authorization = `Bearer <token>`;
    return config;
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      await AsyncStorage.removeItem("authToken")
      // You might want to redirect to login here
    }
    return Promise.reject(error)
  },
)
