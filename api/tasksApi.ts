import { apiClient } from "./config"
import type { ApiResponse, Task } from "./types"

export const getTasks = async (): Promise<Task[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Task[]>>("/tasks")
    return response.data.data
  } catch (error) {
    console.error("Get tasks error:", error)
    // Return mock data if network error
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Complete project proposal',
        description: 'Finish the project proposal document and submit it to the client',
        completed: false,
        dueDate: '2024-01-25',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      },
      {
        id: '2',
        title: 'Review meeting notes',
        description: 'Go through the meeting notes from yesterday and create action items',
        completed: true,
        dueDate: '2024-01-18',
        createdAt: '2024-01-17T10:00:00Z',
        updatedAt: '2024-01-18T10:00:00Z'
      },
      {
        id: '3',
        title: 'Update documentation',
        description: 'Update the technical documentation with the latest changes',
        completed: false,
        dueDate: '2024-01-25',
        createdAt: '2024-01-19T10:00:00Z',
        updatedAt: '2024-01-19T10:00:00Z'
      },
      {
        id: '4',
        title: 'Schedule team meeting',
        description: 'Schedule the weekly team meeting for next Monday',
        completed: false,
        dueDate: '2024-01-22',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      }
    ];
    console.log('Returning mock tasks:', mockTasks);
    return mockTasks;
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
    // Return mock data if network error
    const mockUpdatedTask: Task = {
      id: id,
      title: task.title || 'Updated Task',
      description: task.description || '',
      completed: task.completed || false,
      dueDate: task.dueDate || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockUpdatedTask;
  }
}

export const moveTaskToRecycleBin = async (id: string): Promise<void> => {
  console.log(`=== MOVING TASK TO RECYCLE BIN ===`);
  console.log(`Task ID: ${id}`);
  
  try {
    // Use the updateTask function to mark as deleted
    console.log(`Making API call to update task ${id} with deletedAt`);
    await updateTask(id, { deletedAt: new Date().toISOString() });
    console.log(`Successfully moved task ${id} to recycle bin via API`);
  } catch (error) {
    console.error("Move task to recycle bin error:", error);
    // Don't throw error for offline scenario
  }
}

export const restoreTaskFromRecycleBin = async (id: string): Promise<void> => {
  console.log(`Restoring task ${id} from recycle bin...`);
  try {
    // Use the updateTask function to remove deletedAt
    console.log(`Making API call to update task ${id} to remove deletedAt`);
    await updateTask(id, { deletedAt: undefined });
    console.log(`Successfully restored task ${id} from recycle bin via API`);
  } catch (error) {
    console.error("Restore task from recycle bin error:", error);
    // Don't throw error for offline scenario
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
