import { apiClient } from "./config"
import type { Notebook, ApiResponse } from "./types"

export const getNotebooks = async (): Promise<Notebook[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Notebook[]>>("/notebooks")
    return response.data.data
  } catch (error) {
    console.error("Get notebooks error:", error)
    throw error
  }
}

export const getNotebookById = async (id: string): Promise<Notebook> => {
  try {
    const response = await apiClient.get<ApiResponse<Notebook>>(`/notebooks/${id}`)
    return response.data.data
  } catch (error) {
    console.error("Get notebook by ID error:", error)
    throw error
  }
}

export const createNotebook = async (
  notebook: Omit<Notebook, "id" | "noteCount" | "createdAt" | "updatedAt">,
): Promise<Notebook> => {
  try {
    const response = await apiClient.post<ApiResponse<Notebook>>("/notebooks", notebook)
    return response.data.data
  } catch (error) {
    console.error("Create notebook error:", error)
    throw error
  }
}

export const updateNotebook = async (id: string, notebook: Partial<Notebook>): Promise<Notebook> => {
  try {
    const response = await apiClient.put<ApiResponse<Notebook>>(`/notebooks/${id}`, notebook)
    return response.data.data
  } catch (error) {
    console.error("Update notebook error:", error)
    throw error
  }
}

export const deleteNotebook = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/notebooks/${id}`)
  } catch (error) {
    console.error("Delete notebook error:", error)
    throw error
  }
}
