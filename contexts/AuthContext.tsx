"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react"
import {
    changePassword as apiChangePassword,
    deleteAccount as apiDeleteAccount,
    forgotPassword as apiForgotPassword,
    getAccountInfo as apiGetAccountInfo,
    getAccountProfile as apiGetAccountProfile,
    resendOtp as apiResendOtp,
    resetPassword as apiResetPassword,
    signIn as apiSignIn,
    signOut as apiSignOut,
    signUp as apiSignUp,
    updateAccountProfile as apiUpdateAccountProfile,
    updateAccountSettings as apiUpdateAccountSettings,
    verifyOtp as apiVerifyOtp,
} from "../api/authApi"
import type { User } from "../api/backendTypes"
import { clearAuthToken, setAuthToken } from "../api/config"

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
  resetPassword: (email: string, newPassword: string, otpCode: string) => Promise<void>
  getAccountInfo: () => Promise<any>
  getAccountProfile: () => Promise<{ email: string; username: string; profile?: string }>
  updateAccountProfile: (profile: { email?: string; username?: string; profile?: string }) => Promise<{ email: string; username: string; profile?: string }>
  updateAccountSettings: (settings: any) => Promise<any>
  deleteAccount: () => Promise<void>
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
      console.log('=== LOADING USER FROM STORAGE ===')
      const userData = await AsyncStorage.getItem("user")
      const token = await AsyncStorage.getItem("authToken")
      
      console.log('User data found:', !!userData)
      console.log('Auth token found:', !!token)
      
      if (userData && token) {
        const parsedUser = JSON.parse(userData)
        console.log('Setting user from storage:', parsedUser.email)
        setUser(parsedUser)
      } else {
        console.log('No user data or token found in storage')
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
      console.log('=== SIGN IN PROCESS STARTED ===')
      console.log('Email:', email)
      
      const authResponse = await apiSignIn(email, password)
      console.log('Auth response received:', !!authResponse.authToken)
      
      // Handle the actual response structure from backend
      if (authResponse.authToken) {
        // Create user object from the response data
        const userData = {
          email: authResponse.email,
          username: authResponse.username,
          profile: authResponse.profile,
          twoFA: authResponse.twoFA
        } as User
        
        console.log('Setting user data:', userData.email)
        setUser(userData)
        
        // Save to storage using helper functions
        await AsyncStorage.setItem("user", JSON.stringify(userData))
        await setAuthToken(authResponse.authToken)
        
        console.log('=== SIGN IN COMPLETED SUCCESSFULLY ===')
      } else {
        console.log("Login successful but no auth token in response")
      }
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
      console.log('=== SIGN UP PROCESS STARTED ===')
      console.log('Email:', email)
      console.log('Username:', username)
      
      const authResponse = await apiSignUp(name, email, username, password)
      
      // Check if signup was successful but account needs verification
      if (authResponse && authResponse.authToken) {
        // Create user object from the response data
        const userData = {
          email: authResponse.email,
          username: authResponse.username,
          profile: authResponse.profile,
          twoFA: authResponse.twoFA
        } as User
        
        console.log('Setting user data:', userData.email)
        setUser(userData)
        
        // Save to storage using helper functions
        await AsyncStorage.setItem("user", JSON.stringify(userData))
        await setAuthToken(authResponse.authToken)
        
        console.log('=== SIGN UP COMPLETED SUCCESSFULLY ===')
      } else {
        // Account created but needs verification
        console.log('Account created successfully, verification required')
        // Don't set user or token since verification is needed
        console.log('=== SIGN UP COMPLETED - VERIFICATION REQUIRED ===')
      }
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log('=== SIGN OUT PROCESS STARTED ===')
      await apiSignOut()
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      console.log('Clearing user data and tokens')
      setUser(null)
      await clearAuthToken()
      console.log('=== SIGN OUT COMPLETED ===')
    }
  }

  const logout = async () => {
    console.log('=== LOGOUT PROCESS STARTED ===')
    setUser(null)
    await clearAuthToken()
    await AsyncStorage.removeItem("refreshToken")
    console.log('=== LOGOUT COMPLETED ===')
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
  const resetPassword = async (email: string, newPassword: string, otpCode: string) => {
    try {
      setLoading(true)
      await apiResetPassword(email, newPassword, otpCode)
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Get Account Info
  const getAccountInfo = async () => {
    try {
      setLoading(true)
      return await apiGetAccountInfo()
    } catch (error) {
      console.error("Get account info error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Get Account Profile
  const getAccountProfile = async () => {
    try {
      setLoading(true)
      return await apiGetAccountProfile()
    } catch (error) {
      console.error("Get account profile error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update Account Profile
  const updateAccountProfile = async (profile: { email?: string; username?: string; profile?: string }) => {
    try {
      setLoading(true)
      const updatedProfile = await apiUpdateAccountProfile(profile)
      // Update local user state if needed
      if (user) {
        setUser({ ...user, ...updatedProfile })
        await AsyncStorage.setItem("user", JSON.stringify({ ...user, ...updatedProfile }))
      }
      return updatedProfile
    } catch (error) {
      console.error("Update account profile error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update Account Settings
  const updateAccountSettings = async (settings: any) => {
    try {
      setLoading(true)
      return await apiUpdateAccountSettings(settings)
    } catch (error) {
      console.error("Update account settings error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Delete Account
  const deleteAccount = async () => {
    try {
      setLoading(true)
      await apiDeleteAccount()
      // Clear local data after successful account deletion
      setUser(null)
      await AsyncStorage.multiRemove(["user", "authToken", "refreshToken"])
    } catch (error) {
      console.error("Delete account error:", error)
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
    getAccountInfo,
    getAccountProfile,
    updateAccountProfile,
    updateAccountSettings,
    deleteAccount,
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
