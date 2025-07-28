import { apiClient } from "./config"
import type { AuthResponse, ApiResponse } from "./types"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting login with URL:', `${apiClient.defaults.baseURL}/auth/login`)
    console.log('Request body:', { email, password })
    
    const response = await apiClient.post<any>("/auth/login", {
      email,
      password,
    })

    console.log('Login response:', response.data)

    // Handle the actual response structure from backend
    if (response.data.authToken) {
      await AsyncStorage.setItem("authToken", response.data.authToken)
      // Create a user object from the response
      const user = {
        id: response.data.email, // Using email as ID for now
        fullName: response.data.username || '',
        email: response.data.email,
        username: response.data.username,
        password: '', // Not returned from login
        profile: response.data.profile,
        isVerified: true, // Assuming verified since login worked
        is2faOn: response.data.twoFA || false
      }
      
      return {
        user,
        token: response.data.authToken,
        refreshToken: response.data.authToken // Using same token for now
      }
    }

    return response.data
  } catch (error: any) {
    console.error("Sign in error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    throw error
  }
}

export const signUp = async (fullName: string, email: string, username: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting signup with URL:', `${apiClient.defaults.baseURL}/auth/sign-up`)
    console.log('Request body:', { fullName, email, username, password })
    
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/sign-up", {
      fullName,
      email,
      username,
      password,
    })

    console.log('Signup response:', response.data)

    // Handle the case where signup is successful but requires verification
    if (response.data.success) {
      // If there's a token in the response, store it
      if (response.data.data?.token) {
        await AsyncStorage.setItem("authToken", response.data.data.token)
        await AsyncStorage.setItem("refreshToken", response.data.data.refreshToken)
      }
      // Return the response data, even if it's just a message
      return response.data.data || { message: response.data.message }
    }

    return response.data.data
  } catch (error: any) {
    console.error("Sign up error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    throw error
  }
}

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  try {
    console.log('Attempting forgot password with URL:', `${apiClient.defaults.baseURL}/auth/resend-otp/${email}`)
    
    // Use the resend OTP endpoint to initiate password reset process
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/auth/resend-otp/${email}`)
    
    console.log('Forgot password response:', response.data)
    
    return response.data.data
  } catch (error: any) {
    console.error("Forgot password error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    throw error
  }
}

export const resetPassword = async (email: string, newPassword: string, otpCode: string): Promise<{ message: string }> => {
  try {
    console.log('Attempting password reset with URL:', `${apiClient.defaults.baseURL}/auth/password-reset`)
    console.log('Request body:', { email, newPassword, otpCode })
    
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/auth/password-reset", {
      email,
      newPassword,
      otpCode,
    })
    
    console.log('Password reset response:', response.data)
    
    return response.data.data
  } catch (error: any) {
    console.error("Reset password error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    throw error
  }
}

export const signOut = async (): Promise<void> => {
  try {
    await apiClient.post("/auth/logout")
  } catch (error: any) {
    console.error("Sign out error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
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
  } catch (error: any) {
    console.error("Refresh token error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
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
  } catch (error: any) {
    console.error("OTP verification error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    throw error
  }
}

// Resend OTP
export const resendOtp = async (email: string): Promise<{ message: string }> => {
  try {
    console.log('Attempting resend OTP with URL:', `${apiClient.defaults.baseURL}/auth/resend-otp/${email}`)
    
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/auth/resend-otp/${email}`)
    
    console.log('Resend OTP response:', response.data)
    
    return response.data.data
  } catch (error: any) {
    console.error("Resend OTP error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
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
  } catch (error: any) {
    console.error("Change password error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    throw error
  }
}

// Account Verification
export const verifyAccount = async (token: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/auth/account/verify", {
      token,
    })
    return response.data.data
  } catch (error: any) {
    console.error("Account verification error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    throw error
  }
}

// Account Reset
export const resetAccount = async (email: string): Promise<{ message: string }> => {
  try {
    console.log('Attempting account reset with URL:', `${apiClient.defaults.baseURL}/auth/account-reset/${email}`)
    
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/auth/account-reset/${email}`)
    
    console.log('Account reset response:', response.data)
    
    return response.data.data
  } catch (error: any) {
    console.error("Account reset error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
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

// Test different forgot password endpoints
export const testForgotPasswordEndpoints = async (email: string): Promise<void> => {
  const endpoints = [
    "/auth/forgot-password",
    "/auth/password/forgot", 
    "/auth/reset-password",
    "/auth/password-reset"
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint}`)
      const response = await apiClient.post(endpoint, { email })
      console.log(`✅ ${endpoint} works:`, response.data)
      return
    } catch (error: any) {
      console.log(`❌ ${endpoint} failed:`, error.response?.status, error.response?.data)
    }
  }
  console.log("❌ All forgot password endpoints failed")
}
