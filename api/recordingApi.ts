import { apiClient, API_BASE_URL } from "./config"
import type { Recording, ApiResponse } from "./types"
import * as FileSystem from "expo-file-system"

export const uploadRecording = async (uri: string, noteId?: string): Promise<Recording> => {
  try {
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri)
    if (!fileInfo.exists) {
      throw new Error("Recording file does not exist")
    }

    // Create FormData
    const formData = new FormData()
    formData.append("file", {
      uri: uri,
      name: `recording_${Date.now()}.m4a`,
      type: "audio/m4a",
    } as any)

    if (noteId) {
      formData.append("noteId", noteId)
    }

    // Use fetch for file upload (better for FormData in React Native)
    const response = await fetch(`${API_BASE_URL}/recordings/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const result: ApiResponse<Recording> = await response.json()
    return result.data
  } catch (error) {
    console.error("Upload recording error:", error)
    throw error
  }
}

export const getRecordings = async (): Promise<Recording[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Recording[]>>("/recordings")
    return response.data.data
  } catch (error) {
    console.error("Get recordings error:", error)
    throw error
  }
}

export const deleteRecording = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/recordings/${id}`)
  } catch (error) {
    console.error("Delete recording error:", error)
    throw error
  }
}

export const transcribeRecording = async (id: string): Promise<{ transcription: string }> => {
  try {
    const response = await apiClient.post<ApiResponse<{ transcription: string }>>(`/recordings/${id}/transcribe`)
    return response.data.data
  } catch (error) {
    console.error("Transcribe recording error:", error)
    throw error
  }
}
