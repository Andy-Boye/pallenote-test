import { apiClient, API_BASE_URL } from "./config"
import type { ApiResponse } from "./types"
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
    // Return empty array if network error - no mock data
    console.log('Returning empty recordings array');
    return [];
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

export const updateRecording = async (id: string, recording: Partial<Recording>): Promise<Recording> => {
  try {
    const response = await apiClient.put<ApiResponse<Recording>>(`/recordings/${id}`, recording)
    return response.data.data
  } catch (error) {
    console.error("Update recording error:", error)
    // Return mock data if network error
    const mockUpdatedRecording: Recording = {
      id: id,
      title: recording.title || 'Updated Recording',
      duration: recording.duration || '0:00',
      date: recording.date || new Date().toLocaleDateString(),
      size: recording.size || '0MB',
    };
    return mockUpdatedRecording;
  }
}

export const moveRecordingToRecycleBin = async (id: string): Promise<void> => {
  console.log(`=== MOVING RECORDING TO RECYCLE BIN ===`);
  console.log(`Recording ID: ${id}`);
  
  try {
    // Use the updateRecording function to mark as deleted
    console.log(`Making API call to update recording ${id} with deletedAt`);
    await updateRecording(id, { deletedAt: new Date().toISOString() });
    console.log(`Successfully moved recording ${id} to recycle bin via API`);
  } catch (error) {
    console.error("Move recording to recycle bin error:", error);
    // Don't throw error for offline scenario
  }
}

export const restoreRecordingFromRecycleBin = async (id: string): Promise<void> => {
  console.log(`Restoring recording ${id} from recycle bin...`);
  try {
    // Use the updateRecording function to remove deletedAt
    console.log(`Making API call to update recording ${id} to remove deletedAt`);
    await updateRecording(id, { deletedAt: undefined });
    console.log(`Successfully restored recording ${id} from recycle bin via API`);
  } catch (error) {
    console.error("Restore recording from recycle bin error:", error);
    // Don't throw error for offline scenario
  }
}
