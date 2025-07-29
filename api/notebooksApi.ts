import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Notebook } from "./backendTypes";
import { apiClient, getCurrentUserId } from "./config";
import type { ApiResponse } from "./types";

// Store for newly created notebooks
let newlyCreatedNotebooks: Notebook[] = [];

export const getNotebooks = async (): Promise<Notebook[]> => {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("User ID not found");
    }
    
    // Add user filtering to the request
    const response = await apiClient.get<ApiResponse<Notebook[]>>(`/notebooks?userId=${userId}`)
    return response.data.data
  } catch (error) {
    console.error("Get notebooks error:", error)
    // Return mock data if network error with user association
    const userId = await getCurrentUserId() || 'current-user-id';
    
    // Get stored newly created notebooks
    try {
      const storedNotebooks = await AsyncStorage.getItem('newlyCreatedNotebooks');
      if (storedNotebooks) {
        newlyCreatedNotebooks = JSON.parse(storedNotebooks);
      }
    } catch (err) {
      console.error('Error loading stored notebooks:', err);
    }
    
    const baseNotebooks = [
      { 
        id: 'default', 
        title: 'My Notebook', 
        ownerId: userId, 
        isDefault: true,
        createdAt: new Date().toISOString()
      },
      { 
        id: 'work', 
        title: 'Work Notes', 
        ownerId: userId, 
        isDefault: false,
        createdAt: new Date().toISOString()
      },
      { 
        id: 'personal', 
        title: 'Personal Notes', 
        ownerId: userId, 
        isDefault: false,
        createdAt: new Date().toISOString()
      },
      { 
        id: 'ideas', 
        title: 'Ideas & Projects', 
        ownerId: userId, 
        isDefault: false,
        createdAt: new Date().toISOString()
      },
    ];
    
    // Combine base notebooks with newly created ones
    const allNotebooks = [...baseNotebooks, ...newlyCreatedNotebooks];
    console.log('GetNotebooks - All notebooks:', allNotebooks);
    return allNotebooks;
  }
}

export const getNotebookById = async (id: string): Promise<Notebook> => {
  try {
    const response = await apiClient.get<ApiResponse<Notebook>>(`/notebooks/${id}`)
    return response.data.data
  } catch (error) {
    console.error("Get notebook by ID error:", error)
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    
    // Get stored newly created notebooks
    try {
      const storedNotebooks = await AsyncStorage.getItem('newlyCreatedNotebooks');
      if (storedNotebooks) {
        newlyCreatedNotebooks = JSON.parse(storedNotebooks);
      }
    } catch (err) {
      console.error('Error loading stored notebooks:', err);
    }
    
    // Check if it's a default notebook
    if (id === 'default') {
      return {
        id: 'default',
        title: 'My Notebook',
        ownerId: userId,
        isDefault: true,
        createdAt: new Date().toISOString()
      };
    }
    
    // Check if it's a base notebook
    const baseNotebooks = [
      { id: 'work', title: 'Work Notes' },
      { id: 'personal', title: 'Personal Notes' },
      { id: 'ideas', title: 'Ideas & Projects' }
    ];
    
    const baseNotebook = baseNotebooks.find(nb => nb.id === id);
    if (baseNotebook) {
      return {
        ...baseNotebook,
        ownerId: userId,
        isDefault: false,
        createdAt: new Date().toISOString()
      };
    }
    
    // Check if it's a newly created notebook
    const newNotebook = newlyCreatedNotebooks.find(nb => nb.id === id);
    if (newNotebook) {
      return newNotebook;
    }
    
    // If not found, return a generic notebook
    return {
      id: id,
      title: 'Notebook',
      ownerId: userId,
      isDefault: false,
      createdAt: new Date().toISOString()
    };
  }
}

export const createNotebook = async (
  notebook: Omit<Notebook, "id" | "noteCount" | "createdAt" | "updatedAt">,
): Promise<Notebook> => {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("User ID not found");
    }
    
    // Add user association to the notebook
    const notebookWithUser = {
      ...notebook,
      ownerId: userId,
    };
    
    const response = await apiClient.post<ApiResponse<Notebook>>("/notebooks", notebookWithUser)
    return response.data.data
  } catch (error) {
    console.error("Create notebook error:", error)
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockNotebook: Notebook = {
      id: `notebook_${Date.now()}`,
      title: notebook.title,
      ownerId: userId,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    
    // Store the newly created notebook
    try {
      newlyCreatedNotebooks.push(mockNotebook);
      await AsyncStorage.setItem('newlyCreatedNotebooks', JSON.stringify(newlyCreatedNotebooks));
      console.log("Stored new notebook:", mockNotebook);
      console.log("All stored notebooks:", newlyCreatedNotebooks);
    } catch (err) {
      console.error('Error storing new notebook:', err);
    }
    
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

export const deleteNotebookAndContents = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/notebooks/${id}/with-contents`)
  } catch (error) {
    console.error("Delete notebook and contents error:", error)
    throw error
  }
}

export const moveNotesToDefaultNotebook = async (notebookId: string): Promise<void> => {
  try {
    await apiClient.put(`/notebooks/${notebookId}/move-notes-to-default`)
  } catch (error) {
    console.error("Move notes to default notebook error:", error)
    throw error
  }
}
