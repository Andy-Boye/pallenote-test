import { apiClient } from "./config"
import type { AuthResponse, ApiResponse } from "./types"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", {
      email,
      password,
    })

    if (response.data.success && response.data.data.token) {
      await AsyncStorage.setItem("authToken", response.data.data.token)
      await AsyncStorage.setItem("refreshToken", response.data.data.refreshToken)
    }

    return response.data.data
  } catch (error) {
    console.error("Sign in error:", error)
    throw error
  }
}

export const signUp = async (fullName: string, email: string, username: string, password: string): Promise<AuthResponse> => {
  let response:any;
  try {
    console.log('Attempting signup with URL:', `${apiClient.defaults.baseURL}/auth/sign-up`)
    console.log('Request body:', { fullName, email, username, password })
    
     response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/sign-up", {
      fullName,
      email,
      username,
      password,
    })

    console.log('Signup response:', response.data)

    if (response.data.success && response.data.data.token) {
      await AsyncStorage.setItem("authToken", response.data.data.token)
      await AsyncStorage.setItem("refreshToken", response.data.data.refreshToken)
    }

    return response.data
  } catch (error: any) {
    console.log("Error:"+response.data.error)
  }
}

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/auth/forgot-password", {
      email,
    })
    return response.data.data
  } catch (error) {
    console.error("Forgot password error:", error)
    throw error
  }
}

export const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/auth/reset-password", {
      token,
      newPassword,
    })
    return response.data.data
  } catch (error) {
    console.error("Reset password error:", error)
    throw error
  }
}

export const signOut = async (): Promise<void> => {
  try {
    await apiClient.post("/auth/logout")
  } catch (error) {
    console.error("Sign out error:", error)
  } finally {
    await AsyncStorage.multiRemove(["authToken", "refreshToken"])
  }
}

export const refreshToken = async (): Promise<string> => {
  try {
    const refreshToken = await AsyncStorage.getItem("refreshToken")
    if (!refreshToken) throw new Error("No refresh token available")

    const response = await apiClient.post<ApiResponse<{ token: string }>>("/auth/refresh", {
      refreshToken,
    })

    const newToken = response.data.data.token
    await AsyncStorage.setItem("authToken", newToken)
    return newToken
  } catch (error) {
    console.error("Refresh token error:", error)
    await AsyncStorage.multiRemove(["authToken", "refreshToken"])
    throw error
  }
}

// OTP Verification
export const verifyOtp = async (email: string, otp: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/auth/verify-otp", {
      email,
      otp,
    })
    return response.data.data
  } catch (error) {
    console.error("OTP verification error:", error)
    throw error
  }
}

// Resend OTP
export const resendOtp = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/auth/resend-otp", {
      email,
    })
    return response.data.data
  } catch (error) {
    console.error("Resend OTP error:", error)
    throw error
  }
}

// Change Password (for logged-in users)
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.patch<ApiResponse<{ message: string }>>("/auth/change-password", {
      currentPassword,
      newPassword,
    })
    return response.data.data
  } catch (error) {
    console.error("Change password error:", error)
    throw error
  }
}

// Test backend connectivity
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get("/")
    console.log("Backend is reachable:", response.status)
    return true
  } catch (error) {
    console.error("Backend connection test failed:", error)
    return false
  }
}
