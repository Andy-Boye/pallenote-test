import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Notebook } from "./backendTypes";
import { apiClient, getCurrentUserId } from "./config";
import type { ApiResponse } from "./types";

// Store for newly created notebooks
let newlyCreatedNotebooks: Notebook[] = [];

export const getNotebooks = async (includeDeleted: boolean = false): Promise<Notebook[]> => {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("User ID not found");
    }
    
    // Add user filtering to the request
    const response = await apiClient.get<ApiResponse<Notebook[]>>(`/notebooks?userId=${userId}&includeDeleted=${includeDeleted}`)
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
    let allNotebooks = [...baseNotebooks, ...newlyCreatedNotebooks];
    
    // Filter out deleted notebooks unless includeDeleted is true
    if (!includeDeleted) {
      allNotebooks = allNotebooks.filter(notebook => !notebook.deletedAt);
    }
    
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
    
    // Find and update the notebook in local storage
    const notebookIndex = newlyCreatedNotebooks.findIndex(nb => nb.id === id);
    if (notebookIndex !== -1) {
      newlyCreatedNotebooks[notebookIndex] = {
        ...newlyCreatedNotebooks[notebookIndex],
        ...notebook,
        updatedAt: new Date().toISOString()
      };
      
      // Store updated notebooks
      await AsyncStorage.setItem('newlyCreatedNotebooks', JSON.stringify(newlyCreatedNotebooks));
      
      return newlyCreatedNotebooks[notebookIndex];
    }
    
    // If not found in newly created notebooks, return a mock updated notebook
    const mockUpdatedNotebook: Notebook = {
      id: id,
      title: notebook.title || 'Updated Notebook',
      ownerId: userId,
      isDefault: id === 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return mockUpdatedNotebook;
  }
}

export const deleteNotebook = async (id: string): Promise<void> => {
  console.log(`=== DELETING NOTEBOOK ===`);
  console.log(`Notebook ID: ${id}`);
  
  try {
    console.log(`Making API call to: /notebooks/${id}`);
    await apiClient.delete(`/notebooks/${id}`);
    console.log(`Successfully deleted notebook ${id} via API`);
  } catch (error) {
    console.error("Delete notebook error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data,
      url: (error as any)?.config?.url,
    });
    
    // Handle offline scenario by removing from local storage
    try {
      console.log(`Removing notebook ${id} from local storage...`);
      const storedNotebooks = await AsyncStorage.getItem('newlyCreatedNotebooks');
      if (storedNotebooks) {
        newlyCreatedNotebooks = JSON.parse(storedNotebooks);
        newlyCreatedNotebooks = newlyCreatedNotebooks.filter(nb => nb.id !== id);
        await AsyncStorage.setItem('newlyCreatedNotebooks', JSON.stringify(newlyCreatedNotebooks));
        console.log(`Successfully removed notebook ${id} from local storage`);
      }
    } catch (err) {
      console.error('Error updating stored notebooks:', err);
    }
    
    // Re-throw the error so the calling function can handle it
    throw error;
  }
}

export const deleteNotebookAndContents = async (id: string): Promise<void> => {
  console.log(`Attempting to delete notebook ${id} and its contents...`);
  try {
    console.log(`Making API call to: /notebooks/${id}/with-contents`);
    await apiClient.delete(`/notebooks/${id}/with-contents`);
    console.log(`Successfully deleted notebook ${id} and its contents via API`);
  } catch (error) {
    console.error("Delete notebook and contents error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data,
      url: (error as any)?.config?.url,
    });
    
    // Try fallback to simple delete endpoint
    try {
      console.log(`Trying fallback endpoint: /notebooks/${id}`);
      await apiClient.delete(`/notebooks/${id}`);
      console.log(`Successfully deleted notebook ${id} via fallback endpoint`);
    } catch (fallbackError) {
      console.error("Fallback delete notebook error:", fallbackError);
      
      // Handle offline scenario by removing from local storage
      try {
        console.log(`Removing notebook ${id} from local storage...`);
        const storedNotebooks = await AsyncStorage.getItem('newlyCreatedNotebooks');
        if (storedNotebooks) {
          newlyCreatedNotebooks = JSON.parse(storedNotebooks);
          newlyCreatedNotebooks = newlyCreatedNotebooks.filter(nb => nb.id !== id);
          await AsyncStorage.setItem('newlyCreatedNotebooks', JSON.stringify(newlyCreatedNotebooks));
          console.log(`Successfully removed notebook ${id} from local storage`);
        }
      } catch (err) {
        console.error('Error updating stored notebooks:', err);
      }
    }
    // Don't throw error for offline scenario
  }
}

export const moveNotesToDefaultNotebook = async (notebookId: string): Promise<void> => {
  try {
    await apiClient.put(`/notebooks/${notebookId}/move-notes-to-default`)
  } catch (error) {
    console.error("Move notes to default notebook error:", error)
    // Handle offline scenario - in mock data, notes are already associated with notebooks
    // No action needed for offline scenario
  }
}

export const moveNotebookToRecycleBin = async (id: string): Promise<void> => {
  console.log(`=== MOVING NOTEBOOK TO RECYCLE BIN ===`);
  console.log(`Notebook ID: ${id}`);
  
  try {
    // Use the updateNotebook function to mark as deleted
    console.log(`Making API call to update notebook ${id} with deletedAt`);
    await updateNotebook(id, { deletedAt: new Date().toISOString() });
    console.log(`Successfully moved notebook ${id} to recycle bin via API`);
  } catch (error) {
    console.error("Move notebook to recycle bin error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data,
      url: (error as any)?.config?.url,
    });
    
    // Handle offline scenario by updating local storage
    try {
      console.log(`Marking notebook ${id} as deleted in local storage...`);
      const storedNotebooks = await AsyncStorage.getItem('newlyCreatedNotebooks');
      if (storedNotebooks) {
        newlyCreatedNotebooks = JSON.parse(storedNotebooks);
        console.log(`Current stored notebooks:`, newlyCreatedNotebooks);
        
        const notebookIndex = newlyCreatedNotebooks.findIndex(nb => nb.id === id);
        console.log(`Found notebook at index: ${notebookIndex}`);
        
        if (notebookIndex !== -1) {
          const updatedNotebook = {
            ...newlyCreatedNotebooks[notebookIndex],
            deletedAt: new Date().toISOString()
          };
          newlyCreatedNotebooks[notebookIndex] = updatedNotebook;
          
          await AsyncStorage.setItem('newlyCreatedNotebooks', JSON.stringify(newlyCreatedNotebooks));
          console.log(`Successfully marked notebook ${id} as deleted in local storage`);
          console.log(`Updated notebook:`, updatedNotebook);
          console.log(`All stored notebooks after update:`, newlyCreatedNotebooks);
        } else {
          console.log(`Notebook ${id} not found in stored notebooks`);
        }
      } else {
        console.log(`No stored notebooks found in AsyncStorage`);
      }
    } catch (err) {
      console.error('Error updating stored notebooks:', err);
    }
    // Don't throw error for offline scenario
  }
}

export const restoreNotebookFromRecycleBin = async (id: string): Promise<void> => {
  console.log(`Restoring notebook ${id} from recycle bin...`);
  try {
    // Use the updateNotebook function to remove deletedAt
    console.log(`Making API call to update notebook ${id} to remove deletedAt`);
    await updateNotebook(id, { deletedAt: undefined });
    console.log(`Successfully restored notebook ${id} from recycle bin via API`);
  } catch (error) {
    console.error("Restore notebook from recycle bin error:", error);
    
    // Handle offline scenario by updating local storage
    try {
      console.log(`Restoring notebook ${id} in local storage...`);
      const storedNotebooks = await AsyncStorage.getItem('newlyCreatedNotebooks');
      if (storedNotebooks) {
        newlyCreatedNotebooks = JSON.parse(storedNotebooks);
        const notebookIndex = newlyCreatedNotebooks.findIndex(nb => nb.id === id);
        if (notebookIndex !== -1) {
          const { deletedAt, ...notebookWithoutDeletedAt } = newlyCreatedNotebooks[notebookIndex];
          newlyCreatedNotebooks[notebookIndex] = notebookWithoutDeletedAt;
          await AsyncStorage.setItem('newlyCreatedNotebooks', JSON.stringify(newlyCreatedNotebooks));
          console.log(`Successfully restored notebook ${id} in local storage`);
        }
      }
    } catch (err) {
      console.error('Error updating stored notebooks:', err);
    }
    // Don't throw error for offline scenario
  }
}

export const permanentlyDeleteNotebook = async (id: string): Promise<void> => {
  console.log(`Permanently deleting notebook ${id} from recycle bin...`);
  try {
    // Use the existing deleteNotebook function
    console.log(`Making API call to permanently delete notebook ${id}`);
    await deleteNotebook(id);
    console.log(`Successfully permanently deleted notebook ${id} via API`);
  } catch (error) {
    console.error("Permanently delete notebook error:", error);
    
    // Handle offline scenario by removing from local storage
    try {
      console.log(`Removing notebook ${id} from local storage...`);
      const storedNotebooks = await AsyncStorage.getItem('newlyCreatedNotebooks');
      if (storedNotebooks) {
        newlyCreatedNotebooks = JSON.parse(storedNotebooks);
        newlyCreatedNotebooks = newlyCreatedNotebooks.filter(nb => nb.id !== id);
        await AsyncStorage.setItem('newlyCreatedNotebooks', JSON.stringify(newlyCreatedNotebooks));
        console.log(`Successfully removed notebook ${id} from local storage`);
      }
    } catch (err) {
      console.error('Error updating stored notebooks:', err);
    }
    // Don't throw error for offline scenario
  }
}

export const getRecycleBinNotebooks = async (): Promise<Notebook[]> => {
  try {
    console.log('getRecycleBinNotebooks - Fetching all notebooks including deleted...');
    // Use the existing getNotebooks function with includeDeleted=true
    const allNotebooks = await getNotebooks(true);
    
    // Filter only deleted notebooks
    const deletedNotebooks = allNotebooks.filter(notebook => notebook.deletedAt);
    console.log('getRecycleBinNotebooks - All notebooks:', allNotebooks);
    console.log('getRecycleBinNotebooks - Deleted notebooks:', deletedNotebooks);
    return deletedNotebooks;
  } catch (error) {
    console.error("Get recycle bin notebooks error:", error);
    
    // Return empty array if there's an error
    return [];
  }
}


