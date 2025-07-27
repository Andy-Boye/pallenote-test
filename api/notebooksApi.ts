import { apiClient } from "./config"
import type { ApiResponse, Notebook } from "./types"

export const getNotebooks = async (): Promise<Notebook[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Notebook[]>>("/notebooks")
    return response.data.data
  } catch (error) {
    console.error("Get notebooks error:", error)
    // Return mock data if network error
    return [
      { id: 'work', title: 'Work Notes' },
      { id: 'personal', title: 'Personal Notes' },
      { id: 'ideas', title: 'Ideas & Projects' },
    ];
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
    // Return mock data if network error
    const mockNotebook: Notebook = {
      id: `notebook_${Date.now()}`,
      title: notebook.title,
    };
    console.log("Created mock notebook:", mockNotebook);
    return mockNotebook;
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
