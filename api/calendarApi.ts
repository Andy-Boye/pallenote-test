import { apiClient } from "./config"
import type { CalendarEvent, ApiResponse } from "./types"

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const response = await apiClient.get<ApiResponse<CalendarEvent[]>>("/calendar/events")
    return response.data.data
  } catch (error) {
    console.error("Get calendar events error:", error)
    throw error
  }
}

export const getEventById = async (id: string): Promise<CalendarEvent> => {
  try {
    const response = await apiClient.get<ApiResponse<CalendarEvent>>(`/calendar/events/${id}`)
    return response.data.data
  } catch (error) {
    console.error("Get event by ID error:", error)
    throw error
  }
}

export const createEvent = async (
  event: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">,
): Promise<CalendarEvent> => {
  try {
    const response = await apiClient.post<ApiResponse<CalendarEvent>>("/calendar/events", event)
    return response.data.data
  } catch (error) {
    console.error("Create event error:", error)
    throw error
  }
}

export const updateEvent = async (id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
  try {
    const response = await apiClient.put<ApiResponse<CalendarEvent>>(`/calendar/events/${id}`, event)
    return response.data.data
  } catch (error) {
    console.error("Update event error:", error)
    throw error
  }
}

export const deleteEvent = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/calendar/events/${id}`)
  } catch (error) {
    console.error("Delete event error:", error)
    throw error
  }
}
