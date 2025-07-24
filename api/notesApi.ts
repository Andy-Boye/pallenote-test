import { apiClient } from "./config"
import type { ApiResponse, Note } from "./types"

export const getNotes = async (): Promise<Note[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Note[]>>("/notes")
    return response.data.data
  } catch (error) {
    console.error("Get notes error:", error)
    // Return mock data if network error
    return [
      { id: '1', title: 'Meeting Notes', content: 'Today we discussed the upcoming project milestones and assigned tasks to each team member. The main focus was on improving communication and ensuring everyone is clear on their responsibilities. Action items include preparing the next sprint plan and reviewing the current backlog for any blockers.', date: '2024-06-01' },
      { id: '2', title: 'Ideas for App', content: 'Brainstormed several new features for the app, including a dark mode, enhanced notifications, and a collaborative workspace. The team agreed to prototype the most promising ideas and gather user feedback before moving forward.', date: '2024-06-02' },
      { id: '3', title: 'Shopping List', content: 'Created a comprehensive shopping list for the week: fresh vegetables, fruits, dairy products, and household essentials. Also included some special ingredients for the new recipe we plan to try this weekend.', date: '2024-06-03' },
      { id: '4', title: 'Travel Plans', content: 'Outlined the itinerary for the upcoming trip, including flight bookings, hotel reservations, and sightseeing spots. Made a checklist of items to pack and set reminders for important travel documents.', date: '2024-06-04' },
      { id: '5', title: 'Reading List', content: 'Compiled a list of books and articles to read this month, focusing on personal development and technology trends. Set a goal to read at least one book per week and summarize key takeaways.', date: '2024-06-05' },
    ];
  }
}

export const getNoteById = async (id: string): Promise<Note> => {
  try {
    const response = await apiClient.get<ApiResponse<Note>>(`/notes/${id}`)
    return response.data.data
  } catch (error) {
    console.error("Get note by ID error:", error)
    throw error
  }
}

export const createNote = async (note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> => {
  try {
    const response = await apiClient.post<ApiResponse<Note>>("/notes", note)
    return response.data.data
  } catch (error) {
    console.error("Create note error:", error)
    throw error
  }
}

export const updateNote = async (id: string, note: Partial<Note>): Promise<Note> => {
  try {
    const response = await apiClient.put<ApiResponse<Note>>(`/notes/${id}`, note)
    return response.data.data
  } catch (error) {
    console.error("Update note error:", error)
    throw error
  }
}

export const deleteNote = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/notes/${id}`)
  } catch (error) {
    console.error("Delete note error:", error)
    throw error
  }
}

export const searchNotes = async (query: string): Promise<Note[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Note[]>>(`/notes/search?q=${encodeURIComponent(query)}`)
    return response.data.data
  } catch (error) {
    console.error("Search notes error:", error)
    throw error
  }
}
