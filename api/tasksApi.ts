import { apiClient } from "./config"
import type { Task, ApiResponse } from "./types"

export const getTasks = async (): Promise<Task[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Task[]>>("/tasks")
    return response.data.data
  } catch (error) {
    console.error("Get tasks error:", error)
    throw error
  }
}

export const getTaskById = async (id: string): Promise<Task> => {
  try {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`)
    return response.data.data
  } catch (error) {
    console.error("Get task by ID error:", error)
    throw error
  }
}

export const createTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> => {
  try {
    const response = await apiClient.post<ApiResponse<Task>>("/tasks", task)
    return response.data.data
  } catch (error) {
    console.error("Create task error:", error)
    throw error
  }
}

export const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => {
  try {
    const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, task)
    return response.data.data
  } catch (error) {
    console.error("Update task error:", error)
    throw error
  }
}

export const deleteTask = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/tasks/${id}`)
  } catch (error) {
    console.error("Delete task error:", error)
    throw error
  }
}

export const toggleTaskCompletion = async (id: string): Promise<Task> => {
  try {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/toggle`)
    return response.data.data
  } catch (error) {
    console.error("Toggle task completion error:", error)
    throw error
  }
}
