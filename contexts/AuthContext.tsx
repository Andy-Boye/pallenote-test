"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  verifyOtp as apiVerifyOtp,
  resendOtp as apiResendOtp,
  changePassword as apiChangePassword,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
} from "../api/authApi"
import type { User } from "../api/backendTypes"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<void>
  resendOtp: (email: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  isAuthenticated: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user")
      const token = await AsyncStorage.getItem("authToken")
      if (userData && token) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Error loading user:", error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const authResponse = await apiSignIn(email, password)
      setUser(authResponse.user as User)
      await AsyncStorage.setItem("user", JSON.stringify(authResponse.user))
      await AsyncStorage.setItem("authToken", authResponse.token)
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (name: string, email: string, username: string, password: string) => {
    try {
      setLoading(true)
      const authResponse = await apiSignUp(name, email, username, password)
      setUser(authResponse.user as User)
      await AsyncStorage.setItem("user", JSON.stringify(authResponse.user))
      await AsyncStorage.setItem("authToken", authResponse.token)
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await apiSignOut()
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setUser(null)
      await AsyncStorage.removeItem("user")
      await AsyncStorage.removeItem("authToken")
    }
  }

  const logout = async () => {
    setUser(null)
    await AsyncStorage.removeItem("user")
    await AsyncStorage.removeItem("authToken")
    await AsyncStorage.removeItem("refreshToken")
  }

  // OTP Verification
  const verifyOtp = async (email: string, otp: string) => {
    try {
      setLoading(true)
      await apiVerifyOtp(email, otp)
      // After successful OTP verification, user can proceed to login
    } catch (error) {
      console.error("OTP verification error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const resendOtp = async (email: string) => {
    try {
      setLoading(true)
      await apiResendOtp(email)
    } catch (error) {
      console.error("Resend OTP error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Change Password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true)
      await apiChangePassword(currentPassword, newPassword)
    } catch (error) {
      console.error("Change password error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Forgot Password
  const forgotPassword = async (email: string) => {
    try {
      setLoading(true)
      await apiForgotPassword(email)
    } catch (error) {
      console.error("Forgot password error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Reset Password
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setLoading(true)
      await apiResetPassword(token, newPassword)
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    verifyOtp,
    resendOtp,
    changePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return { ...context, logout: context.logout }
}
