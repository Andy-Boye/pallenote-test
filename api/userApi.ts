import { apiClient } from "./config"
import type { User, ApiResponse } from "./types"

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get<ApiResponse<User>>("/user/profile")
    return response.data.data
  } catch (error) {
    console.error("Get user profile error:", error)
    throw error
  }
}

export const updateUserProfile = async (user: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.put<ApiResponse<User>>("/user/profile", user)
    return response.data.data
  } catch (error) {
    console.error("Update user profile error:", error)
    throw error
  }
}

export const uploadAvatar = async (uri: string): Promise<{ avatarUrl: string }> => {
  try {
    const formData = new FormData()
    formData.append("avatar", {
      uri: uri,
      name: "avatar.jpg",
      type: "image/jpeg",
    } as any)

    const response = await fetch(`${apiClient.defaults.baseURL}/user/avatar`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Avatar upload failed: ${response.statusText}`)
    }

    const result: ApiResponse<{ avatarUrl: string }> = await response.json()
    return result.data
  } catch (error) {
    console.error("Upload avatar error:", error)
    throw error
  }
}

export const deleteAccount = async (): Promise<void> => {
  try {
    await apiClient.delete("/user/account")
  } catch (error) {
    console.error("Delete account error:", error)
    throw error
  }
}
