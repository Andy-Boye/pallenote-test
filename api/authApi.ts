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

export const signUp = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/signup", {
      name,
      email,
      password,
    })

    if (response.data.success && response.data.data.token) {
      await AsyncStorage.setItem("authToken", response.data.data.token)
      await AsyncStorage.setItem("refreshToken", response.data.data.refreshToken)
    }

    return response.data.data
  } catch (error) {
    console.error("Sign up error:", error)
    throw error
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
