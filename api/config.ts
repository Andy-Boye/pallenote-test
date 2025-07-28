import AsyncStorage from "@react-native-async-storage/async-storage"
import axios, { type AxiosRequestHeaders } from "axios"
// Use process.env.NODE_ENV for dev check

// API Configuration
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('API_BASE_URL before assignment:', process.env.API_BASE_URL)
export const API_BASE_URL = "https://pella-notes.onrender.com/api/v1"
console.log('API_BASE_URL after assignment:', API_BASE_URL)

// Create axios instance with default config
console.log('Creating axios instance with baseURL:', API_BASE_URL)
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
})
console.log('Axios instance created with baseURL:', apiClient.defaults.baseURL)

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken")
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error("Error getting auth token:", error)
    }
    return config
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
