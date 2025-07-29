import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
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
      console.log('=== API REQUEST INTERCEPTOR ===')
      console.log('Request URL:', config.url)
      console.log('Request method:', config.method)
      console.log('Auth token found:', !!token)
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('Authorization header set:', `Bearer ${token.substring(0, 20)}...`)
      } else {
        console.log('No auth token found or no headers config')
      }
    } catch (error) {
      console.error("Error getting auth token:", error)
    }
    return config
  },
  (error) => {
    console.error("Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('=== API RESPONSE SUCCESS ===')
    console.log('Response URL:', response.config.url)
    console.log('Response status:', response.status)
    return response
  },
  async (error) => {
    console.log('=== API RESPONSE ERROR ===')
    console.log('Error URL:', error.config?.url)
    console.log('Error status:', error.response?.status)
    console.log('Error message:', error.message)
    
    if (error.response?.status === 401) {
      console.log('Unauthorized error - clearing auth token')
      // Handle token expiration
      await AsyncStorage.removeItem("authToken")
      await AsyncStorage.removeItem("user")
      // You might want to redirect to login here
      console.log('Auth tokens cleared due to 401 error')
    }
    return Promise.reject(error)
  },
)

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("authToken")
    const user = await AsyncStorage.getItem("user")
    return !!(token && user)
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

// Helper function to get auth token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("authToken")
  } catch (error) {
    console.error("Error getting auth token:", error)
    return null
  }
}

// Helper function to set auth token
export const setAuthToken = async (token: string | null | undefined): Promise<void> => {
  try {
    if (token) {
      await AsyncStorage.setItem("authToken", token)
      console.log('Auth token saved successfully')
    } else {
      console.log('No auth token provided, skipping storage')
    }
  } catch (error) {
    console.error("Error saving auth token:", error)
  }
}

// Helper function to clear auth token
export const clearAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("authToken")
    await AsyncStorage.removeItem("user")
    console.log('Auth tokens cleared successfully')
  } catch (error) {
    console.error("Error clearing auth tokens:", error)
  }
}

// Helper function to get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const userData = await AsyncStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      return user.id || user.email // Use email as fallback if id doesn't exist
    }
    return null
  } catch (error) {
    console.error("Error getting current user ID:", error)
    return null
  }
}
