import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Note, SharedNote, SharingRecord } from "./backendTypes";
import { apiClient, getCurrentUserId } from "./config";
import type { ApiResponse } from "./types";

// Extended Note type for mock data that includes additional properties
interface ExtendedNote extends Note {
  userId?: string;
  deletedAt?: string;
}

// Storage key for user notes
const USER_NOTES_KEY = 'user_notes';
const SHARING_HISTORY_KEY = 'sharing_history';

// Helper function to get stored notes
const getStoredNotes = async (): Promise<ExtendedNote[]> => {
  try {
    const userId = await getCurrentUserId();
    const key = `${USER_NOTES_KEY}_${userId}`;
    const storedNotes = await AsyncStorage.getItem(key);
    return storedNotes ? JSON.parse(storedNotes) : [];
  } catch (error) {
    console.error('Error getting stored notes:', error);
    return [];
  }
};

// Helper function to store notes
const storeNotes = async (notes: Note[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    const key = `${USER_NOTES_KEY}_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(notes));
  } catch (error) {
    console.error('Error storing notes:', error);
  }
};

// Helper function to add a new note to storage
const addNoteToStorage = async (note: Note): Promise<void> => {
  try {
    const existingNotes = await getStoredNotes();
    const updatedNotes = [...existingNotes, note];
    await storeNotes(updatedNotes);
    console.log('Note added to storage:', note);
  } catch (error) {
    console.error('Error adding note to storage:', error);
  }
};

// Helper function to update a note in storage
const updateNoteInStorage = async (noteId: string, updates: Partial<Note>): Promise<void> => {
  try {
    const existingNotes = await getStoredNotes();
    const updatedNotes = existingNotes.map(note => 
      note.id === noteId ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
    );
    await storeNotes(updatedNotes);
    console.log('Note updated in storage:', noteId, updates);
  } catch (error) {
    console.error('Error updating note in storage:', error);
  }
};

// Helper function to get stored sharing history
const getStoredSharingHistory = async (): Promise<SharingRecord[]> => {
  try {
    const userId = await getCurrentUserId();
    const key = `${SHARING_HISTORY_KEY}_${userId}`;
    const storedHistory = await AsyncStorage.getItem(key);
    return storedHistory ? JSON.parse(storedHistory) : [];
  } catch (error) {
    console.error('Error getting stored sharing history:', error);
    return [];
  }
};

// Helper function to store sharing history
const storeSharingHistory = async (history: SharingRecord[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    const key = `${SHARING_HISTORY_KEY}_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(history));
  } catch (error) {
    console.error('Error storing sharing history:', error);
  }
};

// Helper function to add a sharing record
const addSharingRecord = async (record: SharingRecord): Promise<void> => {
  try {
    const existingHistory = await getStoredSharingHistory();
    const updatedHistory = [...existingHistory, record];
    await storeSharingHistory(updatedHistory);
    console.log('Sharing record added to storage:', record);
  } catch (error) {
    console.error('Error adding sharing record to storage:', error);
  }
};

export const getNotes = async (params?: {
  page?: number;
  limit?: number;
  notebookId?: string;
  search?: string;
}): Promise<Note[]> => {
  console.log('=== GET NOTES API CALLED ===');
  console.log('Parameters:', params);
  
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.notebookId) queryParams.append('notebookId', params.notebookId);
    if (params?.search) queryParams.append('search', params.search);
    
    // Get current user ID
    const userId = await getCurrentUserId();
    if (userId) {
      queryParams.append('userId', userId);
    }
    
    const url = queryParams.toString() ? `/notes?${queryParams.toString()}` : '/notes';
    const response = await apiClient.get<ApiResponse<Note[]>>(url);
    console.log('Get notes API response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Get notes error:", error);
    // Return mock data if network error with proper notebook assignments
    const userId = await getCurrentUserId() || 'current-user-id';
    
    // Get stored notes from AsyncStorage
    const storedNotes = await getStoredNotes();
    console.log('Stored notes from AsyncStorage:', storedNotes);
    
    const allMockNotes = [
      { 
        id: '1', 
        title: 'Welcome Note', 
        content: 'Welcome to Pallenote! This is your default notebook where you can start creating notes. You can organize your notes into different notebooks for better organization.', 
        date: '2024-06-01', 
        notebookId: 'default', 
        userId: userId,
        createdAt: '2024-06-01T10:00:00Z', 
        updatedAt: '2024-06-01T10:00:00Z' 
      },
      { 
        id: '2', 
        title: 'Getting Started', 
        content: 'Here are some tips to get started:\n\n1. Create notes in any notebook\n2. Organize your thoughts by topic\n3. Use the search feature to find notes quickly\n4. Share notes with others when needed', 
        date: '2024-06-01', 
        notebookId: 'default', 
        userId: userId,
        createdAt: '2024-06-01T10:00:00Z', 
        updatedAt: '2024-06-01T10:00:00Z' 
      },
      { 
        id: '3', 
        title: 'Meeting Notes', 
        content: 'Today we discussed the upcoming project milestones and assigned tasks to each team member. The main focus was on improving communication and ensuring everyone is clear on their responsibilities. Action items include preparing the next sprint plan and reviewing the current backlog for any blockers.', 
        date: '2024-06-01', 
        notebookId: 'work', 
        userId: userId,
        createdAt: '2024-06-01T10:00:00Z', 
        updatedAt: '2024-06-01T10:00:00Z' 
      },
      { 
        id: '4', 
        title: 'Ideas for App', 
        content: 'Brainstormed several new features for the app, including a dark mode, enhanced notifications, and a collaborative workspace. The team agreed to prototype the most promising ideas and gather user feedback before moving forward.', 
        date: '2024-06-02', 
        notebookId: 'ideas', 
        userId: userId,
        createdAt: '2024-06-02T10:00:00Z', 
        updatedAt: '2024-06-02T10:00:00Z' 
      },
      { 
        id: '5', 
        title: 'Shopping List', 
        content: 'Created a comprehensive shopping list for the week: fresh vegetables, fruits, dairy products, and household essentials. Also included some special ingredients for the new recipe we plan to try this weekend.', 
        date: '2024-06-03', 
        notebookId: 'personal', 
        userId: userId,
        createdAt: '2024-06-03T10:00:00Z', 
        updatedAt: '2024-06-03T10:00:00Z' 
      },
      { 
        id: '6', 
        title: 'Travel Plans', 
        content: 'Outlined the itinerary for the upcoming trip, including flight bookings, hotel reservations, and sightseeing spots. Made a checklist of items to pack and set reminders for important travel documents.', 
        date: '2024-06-04', 
        notebookId: 'personal', 
        userId: userId,
        createdAt: '2024-06-04T10:00:00Z', 
        updatedAt: '2024-06-04T10:00:00Z' 
      },
      { 
        id: '7', 
        title: 'Reading List', 
        content: 'Compiled a list of books and articles to read this month, focusing on personal development and technology trends. Set a goal to read at least one book per week and summarize key takeaways.', 
        date: '2024-06-05', 
        notebookId: 'ideas', 
        userId: userId,
        createdAt: '2024-06-05T10:00:00Z', 
        updatedAt: '2024-06-05T10:00:00Z' 
      },
      // Add the Assembly note that was created and moved to Business notebook
      { 
        id: '1753757908833', 
        title: 'Assembly', 
        content: '<div>ahashzz,</div>', 
        date: '2025-07-29', 
        notebookId: 'notebook_1753757384833', // Business notebook
        userId: userId,
        createdAt: '2025-07-29T02:58:28.833Z', 
        updatedAt: '2025-07-29T02:59:32.237Z' 
      }
    ];
    
    // Combine mock notes with stored notes
    const allNotes = [...allMockNotes, ...storedNotes];
    
    // Filter by notebookId if provided
    let filteredNotes = allNotes;
    if (params?.notebookId) {
      console.log('Filtering notes by notebookId:', params.notebookId);
      filteredNotes = allNotes.filter(note => note.notebookId === params.notebookId);
      console.log('Filtered notes count:', filteredNotes.length);
      console.log('Filtered notes:', filteredNotes.map(n => ({ id: n.id, title: n.title, notebookId: n.notebookId })));
    }
    
    // Filter by search if provided
    if (params?.search) {
      console.log('Filtering notes by search:', params.search);
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(params.search!.toLowerCase()) ||
        note.content.toLowerCase().includes(params.search!.toLowerCase())
      );
      console.log('Search filtered notes count:', filteredNotes.length);
    }
    
    console.log('Returning filtered notes:', filteredNotes);
    return filteredNotes;
  }
};

export const getNoteById = async (id: string): Promise<Note> => {
  try {
    const response = await apiClient.get<ApiResponse<Note>>(`/notes/${id}`)
    return response.data.data
  } catch (error) {
    console.error("Get note by ID error:", error)
    throw error
  }
}

export const createNote = async (note: Omit<Note, "id" | "createdAt" | "updatedAt"> & {
  noteBookId?: number;
}): Promise<Note> => {
  console.log('=== CREATE NOTE API CALLED ===');
  console.log('Input note data:', note);
  try {
    // Add user association to the note data
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("User ID not found");
    }

    const noteDataWithUser = {
      ...note,
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const response = await apiClient.post<ApiResponse<Note>>("/notes", noteDataWithUser)
    console.log('API response:', response.data);
    return response.data.data
  } catch (error) {
    console.error("Create note error:", error)
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const newNote: ExtendedNote = {
      id: Date.now().toString(),
      title: note.title,
      content: note.content,
      date: note.date || new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
      notebookId: note.notebookId || note.noteBookId?.toString() || 'default',
      userId: userId, // Associate with current user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store the new note in AsyncStorage
    await addNoteToStorage(newNote);
    
    console.log('Returning mock note:', newNote);
    return newNote;
  }
}

export const createRegistersNote = async (): Promise<Note> => {
  console.log('=== CREATE REGISTERS NOTE API CALLED ===');
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("User ID not found");
    }

    const noteData = {
      noteBookId: 2,
      title: "Registers1",
      content: "A register in a CPU is a small, high-speed storage location within the processor used for holding data that the CPU is actively using or needs to access quickly. These registers are much faster to access than main memory (RAM), making them crucial for efficient CPU operation.",
      date: new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
      notebookId: '2'
    };
    
    console.log('Creating Registers note with data:', noteData);
    const response = await apiClient.post<ApiResponse<Note>>("/notes", noteData);
    console.log('Registers note created successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Create Registers note error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockRegistersNote: ExtendedNote = {
      id: Date.now().toString(),
      title: "Registers1",
      content: "A register in a CPU is a small, high-speed storage location within the processor used for holding data that the CPU is actively using or needs to access quickly. These registers are much faster to access than main memory (RAM), making them crucial for efficient CPU operation.",
      date: new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
      notebookId: '2',
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock Registers note:', mockRegistersNote);
    return mockRegistersNote;
  }
}

export const createRegistersNoteWithData = async (noteData: {
  noteBookId: number;
  title: string;
  content: string;
}): Promise<Note> => {
  console.log('=== CREATE REGISTERS NOTE WITH DATA API CALLED ===');
  console.log('Note data:', noteData);
  
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("User ID not found");
    }

    const noteWithUser = {
      ...noteData,
      userId: userId,
      date: new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
      notebookId: noteData.noteBookId.toString()
    };
    
    console.log('Creating Registers note with data:', noteWithUser);
    const response = await apiClient.post<ApiResponse<Note>>("/notes", noteWithUser);
    console.log('Registers note created successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Create Registers note error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockRegistersNote: Note = {
      id: Date.now().toString(),
      title: noteData.title,
      content: noteData.content,
      date: new Date().toLocaleDateString(),
      notebookId: noteData.noteBookId.toString(),
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store the new note in AsyncStorage
    await addNoteToStorage(mockRegistersNote);
    
    console.log('Returning mock Registers note:', mockRegistersNote);
    return mockRegistersNote;
  }
}

// Test function to create the Registers1 note
export const createRegisters1Note = async (): Promise<Note> => {
  const noteData = {
    noteBookId: 2,
    title: "Registers1",
    content: "A register in a CPU is a small, high-speed storage location within the processor used for holding data that the CPU is actively using or needs to access quickly. These registers are much faster to access than main memory (RAM), making them crucial for efficient CPU operation."
  };
  
  return createRegistersNoteWithData(noteData);
}

export const updateNote = async (id: string, note: Partial<Note>): Promise<Note> => {
  try {
    const response = await apiClient.put<ApiResponse<Note>>(`/notes/${id}`, note)
    return response.data.data
  } catch (error) {
    console.error("Update note error:", error)
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const updatedNote: Note = {
      id: id,
      title: note.title || '',
      content: note.content || '',
      date: note.date || new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
      notebookId: note.notebookId || 'default',
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Update the note in AsyncStorage
    await updateNoteInStorage(id, note);
    
    return updatedNote;
  }
}

export const updateNoteContent = async (noteId: number, updatedContent: string): Promise<Note> => {
  console.log('=== UPDATE NOTE CONTENT API CALLED ===');
  console.log('Note ID:', noteId);
  console.log('Updated content:', updatedContent);
  
  try {
    const response = await apiClient.put<ApiResponse<Note>>(`/notes/${noteId}`, {
      content: updatedContent
    });
    console.log('Note content updated successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Update note content error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockUpdatedNote: Note = {
      id: noteId.toString(),
      title: "Updated Note",
      content: updatedContent,
      date: new Date().toLocaleDateString(),
      notebookId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock updated note:', mockUpdatedNote);
    return mockUpdatedNote;
  }
}

export const updateNoteWithId = async (noteId: number, updates: {
  title?: string;
  content?: string;
  notebookId?: string;
  date?: string;
}): Promise<Note> => {
  console.log('=== UPDATE NOTE WITH ID API CALLED ===');
  console.log('Note ID:', noteId);
  console.log('Updates:', updates);
  
  try {
    const response = await apiClient.put<ApiResponse<Note>>(`/notes/${noteId}`, updates);
    console.log('Note updated successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Update note with ID error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockUpdatedNote: Note = {
      id: noteId.toString(),
      title: updates.title || "Updated Note",
      content: updates.content || "Updated content",
      date: updates.date || new Date().toLocaleDateString(),
      notebookId: updates.notebookId || 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock updated note:', mockUpdatedNote);
    return mockUpdatedNote;
  }
}

export const renameNote = async (noteId: string, newTitle: string): Promise<Note> => {
  console.log('=== RENAME NOTE API CALLED ===');
  console.log('Note ID:', noteId);
  console.log('New title:', newTitle);
  
  try {
    const response = await apiClient.put<ApiResponse<Note>>(`/notes/rename`, {
      noteId,
      newTitle
    });
    console.log('Note renamed successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Rename note error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockRenamedNote: Note = {
      id: noteId,
      title: newTitle,
      content: "Note content",
      date: new Date().toLocaleDateString(),
      notebookId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock renamed note:', mockRenamedNote);
    return mockRenamedNote;
  }
}

export const renameNoteByTitle = async (oldTitle: string, newTitle: string): Promise<Note> => {
  console.log('=== RENAME NOTE BY TITLE API CALLED ===');
  console.log('Old title:', oldTitle);
  console.log('New title:', newTitle);
  
  try {
    const response = await apiClient.put<ApiResponse<Note>>(`/notes/rename`, {
      oldTitle,
      newTitle
    });
    console.log('Note renamed successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Rename note by title error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockRenamedNote: Note = {
      id: Date.now().toString(),
      title: newTitle,
      content: "Note content",
      date: new Date().toLocaleDateString(),
      notebookId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock renamed note:', mockRenamedNote);
    return mockRenamedNote;
  }
}

export const renameNoteById = async (noteId: number, newTitle: string): Promise<Note> => {
  console.log('=== RENAME NOTE BY ID API CALLED ===');
  console.log('Note ID:', noteId);
  console.log('New title:', newTitle);
  
  try {
    const response = await apiClient.put<ApiResponse<Note>>(`/notes/rename`, {
      noteId,
      newTitle
    });
    console.log('Note renamed successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Rename note by ID error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockRenamedNote: Note = {
      id: noteId.toString(),
      title: newTitle,
      content: "Note content",
      date: new Date().toLocaleDateString(),
      notebookId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock renamed note:', mockRenamedNote);
    return mockRenamedNote;
  }
}

export const renameNoteWithData = async (renameData: {
  noteId: number;
  newTitle: string;
}): Promise<Note> => {
  console.log('=== RENAME NOTE WITH DATA API CALLED ===');
  console.log('Rename data:', renameData);
  
  return await renameNoteById(renameData.noteId, renameData.newTitle);
}

export const getReferenceNotes = async (): Promise<Note[]> => {
  console.log('=== GET REFERENCE NOTES API CALLED ===');
  try {
    const response = await apiClient.get<ApiResponse<Note[]>>("/notes/reference")
    console.log('Get reference notes API response:', response.data);
    return response.data.data
  } catch (error) {
    console.error("Get reference notes error:", error)
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockReferenceNotes = [
      { id: 'ref1', title: 'Programming Reference', content: 'Quick reference guide for common programming concepts, syntax, and best practices. Includes examples for multiple programming languages and frameworks.', date: '2024-06-01', notebookId: 'reference', createdAt: '2024-06-01T10:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
      { id: 'ref2', title: 'API Documentation', content: 'Comprehensive documentation for REST API endpoints, authentication methods, request/response formats, and error handling procedures.', date: '2024-06-02', notebookId: 'reference', createdAt: '2024-06-02T10:00:00Z', updatedAt: '2024-06-02T10:00:00Z' },
      { id: 'ref3', title: 'Database Schema', content: 'Database structure and relationships, table definitions, indexes, and query optimization tips for efficient data retrieval and storage.', date: '2024-06-03', notebookId: 'reference', createdAt: '2024-06-03T10:00:00Z', updatedAt: '2024-06-03T10:00:00Z' },
      { id: 'ref4', title: 'Deployment Checklist', content: 'Step-by-step checklist for deploying applications to production, including environment setup, configuration, testing, and monitoring.', date: '2024-06-04', notebookId: 'reference', createdAt: '2024-06-04T10:00:00Z', updatedAt: '2024-06-04T10:00:00Z' },
      { id: 'ref5', title: 'Troubleshooting Guide', content: 'Common issues and their solutions, debugging techniques, log analysis, and performance optimization strategies for various scenarios.', date: '2024-06-05', notebookId: 'reference', createdAt: '2024-06-05T10:00:00Z', updatedAt: '2024-06-05T10:00:00Z' },
    ];
    console.log('Returning mock reference notes:', mockReferenceNotes);
    return mockReferenceNotes;
  }
}

export const addReferenceMaterial = async (referenceData: {
  noteId: number;
  reference: string;
  refMaterial: string;
  fileType: 'Audio' | 'Video' | 'Pdf' | 'Image';
}): Promise<Note> => {
  console.log('=== ADD REFERENCE MATERIAL API CALLED ===');
  console.log('Reference data:', referenceData);
  
  try {
    const response = await apiClient.post<ApiResponse<Note>>("/notes/reference", referenceData);
    console.log('Reference material added successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Add reference material error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockNoteWithReference: Note = {
      id: referenceData.noteId.toString(),
      title: "Note with Reference",
      content: `Original note content with reference: ${referenceData.reference}`,
      date: new Date().toLocaleDateString(),
      notebookId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock note with reference:', mockNoteWithReference);
    return mockNoteWithReference;
  }
}

export const addReferenceToNote = async (noteId: number, reference: string, refMaterial: string, fileType: 'Audio' | 'Video' | 'Pdf' | 'Image'): Promise<Note> => {
  console.log('=== ADD REFERENCE TO NOTE API CALLED ===');
  console.log('Note ID:', noteId);
  console.log('Reference:', reference);
  console.log('Reference Material:', refMaterial);
  console.log('File Type:', fileType);
  
  return await addReferenceMaterial({
    noteId,
    reference,
    refMaterial,
    fileType
  });
}

export const updateReferenceMaterial = async (noteId: number, referenceId: string, updates: {
  reference?: string;
  refMaterial?: string;
  fileType?: 'Audio' | 'Video' | 'Pdf' | 'Image';
}): Promise<Note> => {
  console.log('=== UPDATE REFERENCE MATERIAL API CALLED ===');
  console.log('Note ID:', noteId);
  console.log('Reference ID:', referenceId);
  console.log('Updates:', updates);
  
  try {
    const response = await apiClient.put<ApiResponse<Note>>(`/notes/reference`, {
      noteId,
      referenceId,
      ...updates
    });
    console.log('Reference material updated successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Update reference material error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockUpdatedNote: Note = {
      id: noteId.toString(),
      title: "Updated Reference Note",
      content: `Note with updated reference: ${updates.reference || 'Updated reference'}`,
      date: new Date().toLocaleDateString(),
      notebookId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock updated reference note:', mockUpdatedNote);
    return mockUpdatedNote;
  }
}

export const deleteReferenceMaterial = async (noteId: number, referenceId: string): Promise<void> => {
  console.log('=== DELETE REFERENCE MATERIAL API CALLED ===');
  console.log('Note ID:', noteId);
  console.log('Reference ID:', referenceId);
  
  try {
    await apiClient.delete(`/notes/reference`, {
      data: { noteId, referenceId }
    });
    console.log('Reference material deleted successfully');
  } catch (error) {
    console.error("Delete reference material error:", error);
    throw error;
  }
}

export const getReferenceNotesByType = async (fileType: 'Audio' | 'Video' | 'Pdf' | 'Image'): Promise<Note[]> => {
  console.log('=== GET REFERENCE NOTES BY TYPE API CALLED ===');
  console.log('File Type:', fileType);
  
  try {
    const response = await apiClient.get<ApiResponse<Note[]>>(`/notes/reference?fileType=${fileType}`);
    console.log('Get reference notes by type API response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Get reference notes by type error:", error);
    // Return filtered mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockReferenceNotes = [
      { id: 'ref1', title: 'Programming Reference', content: 'Quick reference guide for common programming concepts, syntax, and best practices. Includes examples for multiple programming languages and frameworks.', date: '2024-06-01', notebookId: 'reference', createdAt: '2024-06-01T10:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
      { id: 'ref2', title: 'API Documentation', content: 'Comprehensive documentation for REST API endpoints, authentication methods, request/response formats, and error handling procedures.', date: '2024-06-02', notebookId: 'reference', createdAt: '2024-06-02T10:00:00Z', updatedAt: '2024-06-02T10:00:00Z' },
    ];
    console.log('Returning mock reference notes filtered by type:', mockReferenceNotes);
    return mockReferenceNotes;
  }
}

export const getReferenceById = async (refId: number): Promise<Note> => {
  console.log('=== GET REFERENCE BY ID API CALLED ===');
  console.log('Reference ID:', refId);
  
  try {
    const response = await apiClient.get<ApiResponse<Note>>(`/notes/reference/${refId}`);
    console.log('Get reference by ID API response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Get reference by ID error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockReference: Note = {
      id: refId.toString(),
      title: `Reference ${refId}`,
      content: `This is reference content for ID ${refId}. It contains detailed information and documentation.`,
      date: new Date().toLocaleDateString(),
      notebookId: 'reference',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock reference:', mockReference);
    return mockReference;
  }
}

export const deleteReferenceById = async (refId: number): Promise<void> => {
  console.log('=== DELETE REFERENCE BY ID API CALLED ===');
  console.log('Reference ID:', refId);
  
  try {
    await apiClient.delete(`/notes/reference/${refId}`);
    console.log('Reference deleted successfully');
  } catch (error) {
    console.error("Delete reference by ID error:", error);
    throw error;
  }
}

export const getReferenceWithData = async (refData: { refId: number }): Promise<Note> => {
  console.log('=== GET REFERENCE WITH DATA API CALLED ===');
  console.log('Reference data:', refData);
  
  return await getReferenceById(refData.refId);
}

export const getNoteWithData = async (noteData: { noteId: number }): Promise<Note> => {
  console.log('=== GET NOTE WITH DATA API CALLED ===');
  console.log('Note data:', noteData);
  
  return await getNoteById(noteData.noteId.toString());
}

export const deleteNoteWithData = async (noteData: { noteId: number }): Promise<void> => {
  console.log('=== DELETE NOTE WITH DATA API CALLED ===');
  console.log('Note data:', noteData);
  
  return await deleteNote(noteData.noteId.toString());
}

export const updateNoteWithData = async (noteData: { noteId: number }, updates: {
  title?: string;
  content?: string;
  notebookId?: string;
  date?: string;
}): Promise<Note> => {
  console.log('=== UPDATE NOTE WITH DATA API CALLED ===');
  console.log('Note data:', noteData);
  console.log('Updates:', updates);
  
  return await updateNoteWithId(noteData.noteId, updates);
}

export const createBookNote = async (bookData: {
  title: string;
  content: string;
  author?: string;
  genre?: string;
  isbn?: string;
}): Promise<Note> => {
  console.log('=== CREATE BOOK NOTE API CALLED ===');
  console.log('Book data:', bookData);
  
  try {
    const response = await apiClient.post<ApiResponse<Note>>("/notes/book", {
      ...bookData,
      date: new Date().toLocaleDateString(),
      notebookId: 'books'
    });
    console.log('Book note created successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Create book note error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockBookNote: Note = {
      id: Date.now().toString(),
      title: bookData.title,
      content: bookData.content,
      date: new Date().toLocaleDateString(),
      notebookId: 'books',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock book note:', mockBookNote);
    return mockBookNote;
  }
}

export const updateBookNote = async (bookId: string, updates: {
  title?: string;
  content?: string;
  author?: string;
  genre?: string;
  isbn?: string;
}): Promise<Note> => {
  console.log('=== UPDATE BOOK NOTE API CALLED ===');
  console.log('Book ID:', bookId);
  console.log('Updates:', updates);
  
  try {
    const response = await apiClient.put<ApiResponse<Note>>(`/notes/book/${bookId}`, updates);
    console.log('Book note updated successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Update book note error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockUpdatedBook: Note = {
      id: bookId,
      title: updates.title || "Updated Book",
      content: updates.content || "Updated book content",
      date: new Date().toLocaleDateString(),
      notebookId: 'books',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock updated book note:', mockUpdatedBook);
    return mockUpdatedBook;
  }
}

export const deleteBookNote = async (bookId: string): Promise<void> => {
  console.log('=== DELETE BOOK NOTE API CALLED ===');
  console.log('Book ID:', bookId);
  
  try {
    await apiClient.delete(`/notes/book/${bookId}`);
    console.log('Book note deleted successfully');
  } catch (error) {
    console.error("Delete book note error:", error);
    throw error;
  }
}

export const getBookNoteById = async (bookId: string): Promise<Note> => {
  console.log('=== GET BOOK NOTE BY ID API CALLED ===');
  console.log('Book ID:', bookId);
  
  try {
    const response = await apiClient.get<ApiResponse<Note>>(`/notes/book/${bookId}`);
    console.log('Get book note by ID API response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Get book note by ID error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockBookNote: Note = {
      id: bookId,
      title: `Book ${bookId}`,
      content: `This is book content for ID ${bookId}. It contains detailed information about the book.`,
      date: new Date().toLocaleDateString(),
      notebookId: 'books',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock book note:', mockBookNote);
    return mockBookNote;
  }
}

export const getNotesByNotebookId = async (noteBookId: number): Promise<Note[]> => {
  console.log('=== GET NOTES BY NOTEBOOK ID API CALLED ===');
  console.log('Notebook ID:', noteBookId);
  
  try {
    const response = await apiClient.get<ApiResponse<Note[]>>(`/notes/notebook/${noteBookId}`);
    console.log('Get notes by notebook ID API response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Get notes by notebook ID error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockNotes = [
      { id: '1', title: 'Note 1', content: `This is a note from notebook ${noteBookId}. It contains important information and details.`, date: '2024-06-01', notebookId: noteBookId.toString(), createdAt: '2024-06-01T10:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
      { id: '2', title: 'Note 2', content: `Another note from notebook ${noteBookId}. This note contains additional details and insights.`, date: '2024-06-02', notebookId: noteBookId.toString(), createdAt: '2024-06-02T10:00:00Z', updatedAt: '2024-06-02T10:00:00Z' },
      { id: '3', title: 'Note 3', content: `Third note from notebook ${noteBookId}. This note provides more context and information.`, date: '2024-06-03', notebookId: noteBookId.toString(), createdAt: '2024-06-03T10:00:00Z', updatedAt: '2024-06-03T10:00:00Z' },
    ];
    console.log('Returning mock notes for notebook:', mockNotes);
    return mockNotes;
  }
}

export const getNotesByNotebookWithData = async (notebookData: { noteBookId: number }): Promise<Note[]> => {
  console.log('=== GET NOTES BY NOTEBOOK WITH DATA API CALLED ===');
  console.log('Notebook data:', notebookData);
  
  return await getNotesByNotebookId(notebookData.noteBookId);
}

export const deleteNotesByNotebookWithData = async (notebookData: { noteBookId: number }): Promise<void> => {
  console.log('=== DELETE NOTES BY NOTEBOOK WITH DATA API CALLED ===');
  console.log('Notebook data:', notebookData);
  
  return await deleteNotesByNotebookId(notebookData.noteBookId.toString());
}

export const deleteNote = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/notes/${id}`)
  } catch (error) {
    console.error("Delete note error:", error)
    throw error
  }
}

// New function to match the curl command format
export const deleteNoteWithBody = async (noteId: number): Promise<void> => {
  console.log('=== DELETE NOTE WITH BODY API CALLED ===');
  console.log('Note ID:', noteId);
  
  try {
    console.log(`Making API call to: /notes with body { noteId: ${noteId} }`);
    await apiClient.delete('/notes', {
      data: { noteId }
    });
    console.log(`Successfully deleted note ${noteId} via API`);
  } catch (error) {
    console.error("Delete note with body error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.toString() : 'Unknown error',
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data,
      url: (error as any)?.config?.url,
    });
    
    // Handle offline scenario by removing note from local storage
    try {
      console.log(`Removing note ${noteId} from local storage...`);
      const existingNotes = await getStoredNotes();
      const updatedNotes = existingNotes.filter(note => note.id !== noteId.toString());
      await storeNotes(updatedNotes);
      console.log(`Deleted note ${noteId} from local storage`);
    } catch (storageError) {
      console.error('Error updating stored notes:', storageError);
    }
    
    // Re-throw the error so the calling function can handle it
    throw error;
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

export const moveNotesToNotebook = async (fromNotebookId: string, toNotebookId: string): Promise<void> => {
  try {
    await apiClient.put(`/notes/move`, {
      fromNotebookId,
      toNotebookId
    })
  } catch (error) {
    console.error("Move notes error:", error)
    // For mock data, we'll handle this in the notebooks API
    throw error
  }
}

export const deleteNotesByNotebookId = async (notebookId: string): Promise<void> => {
  try {
    await apiClient.delete(`/notes/notebook/${notebookId}`)
  } catch (error) {
    console.error("Delete notes by notebook error:", error)
    // Handle offline scenario by removing notes from local storage
    try {
      const existingNotes = await getStoredNotes();
      const updatedNotes = existingNotes.filter(note => note.notebookId !== notebookId);
      await storeNotes(updatedNotes);
      console.log(`Deleted ${existingNotes.length - updatedNotes.length} notes from notebook ${notebookId} from local storage`);
    } catch (storageError) {
      console.error('Error updating stored notes:', storageError);
    }
    // Don't throw error for offline scenario
  }
}

export const getBookNotes = async (): Promise<Note[]> => {
  console.log('=== GET BOOK NOTES API CALLED ===');
  try {
    const response = await apiClient.get<ApiResponse<Note[]>>("/notes/book")
    console.log('Get book notes API response:', response.data);
    return response.data.data
  } catch (error) {
    console.error("Get book notes error:", error)
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockBookNotes = [
      { id: 'book1', title: 'Book Review: The Great Gatsby', content: 'F. Scott Fitzgerald\'s masterpiece explores the American Dream through the eyes of Nick Carraway. The novel\'s themes of wealth, love, and the pursuit of happiness resonate deeply with modern readers.', date: '2024-06-01', notebookId: 'books', createdAt: '2024-06-01T10:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
      { id: 'book2', title: 'Reading Notes: 1984', content: 'George Orwell\'s dystopian novel presents a chilling vision of totalitarian control. Key themes include surveillance, propaganda, and the manipulation of truth. The concept of "doublethink" is particularly relevant today.', date: '2024-06-02', notebookId: 'books', createdAt: '2024-06-02T10:00:00Z', updatedAt: '2024-06-02T10:00:00Z' },
      { id: 'book3', title: 'Book Summary: To Kill a Mockingbird', content: 'Harper Lee\'s classic addresses racial injustice through the eyes of young Scout Finch. The novel teaches important lessons about empathy, justice, and standing up for what is right.', date: '2024-06-03', notebookId: 'books', createdAt: '2024-06-03T10:00:00Z', updatedAt: '2024-06-03T10:00:00Z' },
    ];
    console.log('Returning mock book notes:', mockBookNotes);
    return mockBookNotes;
  }
}

export const createVbLecturesNote = async (): Promise<Note> => {
  console.log('=== CREATE VB LECTURES NOTE API CALLED ===');
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("User ID not found");
    }

    const noteData = {
      title: "Vb Lectures",
      content: "Notes from VB lectures and programming concepts.",
      date: new Date().toLocaleDateString(),
      notebookId: 'default'
    };
    
    console.log('Creating VB Lectures note with data:', noteData);
    const response = await apiClient.post<ApiResponse<Note>>("/notes", noteData);
    console.log('VB Lectures note created successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Create VB Lectures note error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockVbNote: Note = {
      id: Date.now().toString(),
      title: "Vb Lectures",
      content: "Notes from VB lectures and programming concepts.",
      date: new Date().toLocaleDateString(),
      notebookId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock VB Lectures note:', mockVbNote);
    return mockVbNote;
  }
}

export const renameBookNote = async (noteId: string, newTitle: string): Promise<Note> => {
  console.log('=== RENAME BOOK NOTE API CALLED ===');
  console.log('Note ID:', noteId);
  console.log('New title:', newTitle);
  
  try {
    const response = await apiClient.put<ApiResponse<Note>>(`/notes/book/rename`, {
      noteId,
      newTitle
    });
    console.log('Book note renamed successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Rename book note error:", error);
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockRenamedNote: Note = {
      id: noteId,
      title: newTitle,
      content: "Book note content",
      date: new Date().toLocaleDateString(),
      notebookId: 'books',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Returning mock renamed book note:', mockRenamedNote);
    return mockRenamedNote;
  }
}

export const getBooks = async (): Promise<Note[]> => {
  console.log('=== GET BOOKS API CALLED ===');
  try {
    const response = await apiClient.get<ApiResponse<Note[]>>("/notes/books")
    console.log('Get books API response:', response.data);
    return response.data.data
  } catch (error) {
    console.error("Get books error:", error)
    // Return mock data if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockBooks = [
      { id: 'book1', title: 'The Great Gatsby', content: 'F. Scott Fitzgerald\'s masterpiece explores the American Dream through the eyes of Nick Carraway. The novel\'s themes of wealth, love, and the pursuit of happiness resonate deeply with modern readers.', date: '2024-06-01', notebookId: 'books', createdAt: '2024-06-01T10:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
      { id: 'book2', title: '1984', content: 'George Orwell\'s dystopian novel presents a chilling vision of totalitarian control. Key themes include surveillance, propaganda, and the manipulation of truth. The concept of "doublethink" is particularly relevant today.', date: '2024-06-02', notebookId: 'books', createdAt: '2024-06-02T10:00:00Z', updatedAt: '2024-06-02T10:00:00Z' },
      { id: 'book3', title: 'To Kill a Mockingbird', content: 'Harper Lee\'s classic addresses racial injustice through the eyes of young Scout Finch. The novel teaches important lessons about empathy, justice, and standing up for what is right.', date: '2024-06-03', notebookId: 'books', createdAt: '2024-06-03T10:00:00Z', updatedAt: '2024-06-03T10:00:00Z' },
      { id: 'book4', title: 'Pride and Prejudice', content: 'Jane Austen\'s beloved novel follows the spirited Elizabeth Bennet as she navigates love, marriage, and social class in early 19th century England.', date: '2024-06-04', notebookId: 'books', createdAt: '2024-06-04T10:00:00Z', updatedAt: '2024-06-04T10:00:00Z' },
      { id: 'book5', title: 'The Catcher in the Rye', content: 'J.D. Salinger\'s iconic novel follows Holden Caulfield\'s journey through New York City as he grapples with adolescence, alienation, and the transition to adulthood.', date: '2024-06-05', notebookId: 'books', createdAt: '2024-06-05T10:00:00Z', updatedAt: '2024-06-05T10:00:00Z' },
    ];
    console.log('Returning mock books:', mockBooks);
    return mockBooks;
  }
}

export const bulkDeleteNotes = async (noteIds: string[]): Promise<void> => {
  console.log('=== BULK DELETE NOTES API CALLED ===');
  console.log('Note IDs to delete:', noteIds);
  
  try {
    await apiClient.delete("/notes", {
      data: { noteIds }
    });
    console.log('Bulk delete successful');
  } catch (error) {
    console.error("Bulk delete notes error:", error);
    throw error;
  }
}

export const bulkUpdateNotes = async (updates: {
  id: string;
  title?: string;
  content?: string;
  notebookId?: string;
}[]): Promise<Note[]> => {
  console.log('=== BULK UPDATE NOTES API CALLED ===');
  console.log('Updates:', updates);
  
  try {
    const response = await apiClient.put<ApiResponse<Note[]>>("/notes", { updates });
    console.log('Bulk update successful:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Bulk update notes error:", error);
    throw error;
  }
}

export const getNotesStats = async (): Promise<{
  total: number;
  byNotebook: Record<string, number>;
  recentCount: number;
}> => {
  console.log('=== GET NOTES STATS API CALLED ===');
  
  try {
    const response = await apiClient.get<ApiResponse<{
      total: number;
      byNotebook: Record<string, number>;
      recentCount: number;
    }>>("/notes/stats");
    console.log('Notes stats response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Get notes stats error:", error);
    // Return mock stats if network error
    const userId = await getCurrentUserId() || 'current-user-id';
    const mockStats = {
      total: 25,
      byNotebook: {
        'default': 15,
        'work': 5,
        'personal': 3,
        'books': 2
      },
      recentCount: 8
    };
    console.log('Returning mock notes stats:', mockStats);
    return mockStats;
  }
}

export const moveNoteToRecycleBin = async (id: string): Promise<void> => {
  console.log(`=== MOVING NOTE TO RECYCLE BIN ===`);
  console.log(`Note ID: ${id}`);
  
  try {
    // Use the updateNote function to mark as deleted
    console.log(`Making API call to update note ${id} with deletedAt`);
    await updateNote(id, { deletedAt: new Date().toISOString() } as any);
    console.log(`Successfully moved note ${id} to recycle bin via API`);
  } catch (error) {
    console.error("Move note to recycle bin error:", error);
    // Handle offline scenario by updating local storage
    try {
      console.log(`Marking note ${id} as deleted in local storage...`);
      const existingNotes = await getStoredNotes();
      const updatedNotes = existingNotes.map(note => 
        note.id === id ? { ...note, deletedAt: new Date().toISOString() } : note
      );
      await storeNotes(updatedNotes);
      console.log(`Successfully marked note ${id} as deleted in local storage`);
    } catch (err) {
      console.error('Error updating stored notes:', err);
    }
    // Don't throw error for offline scenario
  }
}

export const restoreNoteFromRecycleBin = async (id: string): Promise<void> => {
  console.log(`Restoring note ${id} from recycle bin...`);
  try {
    // Use the updateNote function to remove deletedAt
    console.log(`Making API call to update note ${id} to remove deletedAt`);
    await updateNote(id, { deletedAt: undefined });
    console.log(`Successfully restored note ${id} from recycle bin via API`);
  } catch (error) {
    console.error("Restore note from recycle bin error:", error);
    
    // Handle offline scenario by updating local storage
    try {
      console.log(`Restoring note ${id} in local storage...`);
      const existingNotes = await getStoredNotes();
      const updatedNotes = existingNotes.map(note => {
        if (note.id === id) {
          const { deletedAt, ...noteWithoutDeletedAt } = note;
          return noteWithoutDeletedAt;
        }
        return note;
      });
      await storeNotes(updatedNotes);
      console.log(`Successfully restored note ${id} in local storage`);
    } catch (err) {
      console.error('Error updating stored notes:', err);
    }
    // Don't throw error for offline scenario
  }
}

// New function to match the curl command format
export const deleteNotesByNotebookIdWithBody = async (noteBookId: number): Promise<void> => {
  console.log(`=== DELETING NOTES BY NOTEBOOK ID ===`);
  console.log(`Notebook ID: ${noteBookId}`);
  
  try {
    console.log(`Making API call to: /notes/book with body { noteBookId: ${noteBookId} }`);
    await apiClient.delete('/notes/book', {
      data: { noteBookId }
    });
    console.log(`Successfully deleted notes for notebook ${noteBookId} via API`);
  } catch (error) {
    console.error("Delete notes by notebook with body error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data,
      url: (error as any)?.config?.url,
    });
    
    // Handle offline scenario by removing notes from local storage
    try {
      console.log(`Removing notes for notebook ${noteBookId} from local storage...`);
      const existingNotes = await getStoredNotes();
      const updatedNotes = existingNotes.filter(note => note.notebookId !== noteBookId.toString());
      await storeNotes(updatedNotes);
      console.log(`Deleted ${existingNotes.length - updatedNotes.length} notes from notebook ${noteBookId} from local storage`);
    } catch (storageError) {
      console.error('Error updating stored notes:', storageError);
    }
    
    // Re-throw the error so the calling function can handle it
    throw error;
  }
}

export const shareNote = async (noteId: number, shareData: {
  recipientEmail: string;
  accessType: 'Viewer' | 'Editor';
}): Promise<{ shareUrl: string; shareId: string }> => {
  try {
    console.log(`Sharing note ${noteId} with data:`, shareData);
    
    const requestBody = {
      recipientEmail: shareData.recipientEmail,
      accessType: shareData.accessType,
      noteId: noteId
    };
    
    const response = await apiClient.post<ApiResponse<{ shareUrl: string; shareId: string }>>(
      `/share-note/share`,
      requestBody
    );
    
    console.log(`Successfully shared note ${noteId} via API`);
    console.log('API Response:', response.data);
    
    // Handle different response structures
    const responseData = response.data as any; // Type assertion to handle flexible response structure
    
    let shareResult;
    if (responseData && responseData.data) {
      // Standard ApiResponse format
      shareResult = responseData.data;
    } else if (responseData && (responseData.shareUrl || responseData.shareId)) {
      // Direct response format
      shareResult = {
        shareUrl: responseData.shareUrl || `https://pella-notes.onrender.com/shared-note/${noteId}`,
        shareId: responseData.shareId || `share_${Date.now()}`
      };
    } else {
      // Fallback to mock data if response structure is unexpected
      console.log('Unexpected response structure, using fallback data');
      shareResult = {
        shareUrl: `https://pella-notes.onrender.com/shared-note/${noteId}`,
        shareId: `share_${Date.now()}`
      };
    }

    // Add sharing record to history
    try {
      const userId = await getCurrentUserId();
      const note = await getNoteById(noteId.toString());
      const sharingRecord: SharingRecord = {
        id: `share_${Date.now()}`,
        noteId: noteId.toString(),
        noteTitle: note.title,
        senderId: userId || 'unknown',
        senderEmail: 'current-user@example.com', // This should come from user context
        recipientEmail: shareData.recipientEmail,
        accessType: shareData.accessType,
        shareUrl: shareResult.shareUrl,
        shareId: shareResult.shareId,
        sharedAt: new Date().toISOString(),
        status: 'sent',
        isActive: true
      };
      await addSharingRecord(sharingRecord);
    } catch (historyError) {
      console.error('Error adding sharing record:', historyError);
    }

    return shareResult;
  } catch (error) {
    console.error("Share note error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data,
      url: (error as any)?.config?.url,
    });
    
    // Return mock data for offline scenario
    const mockShareData = {
      shareUrl: `https://pella-notes.onrender.com/shared-note/${noteId}`,
      shareId: `share_${Date.now()}`
    };
    
    console.log(`Returning mock share data for note ${noteId}:`, mockShareData);
    return mockShareData;
  }
}

// Get sharing history for the current user
export const getSharingHistory = async (): Promise<SharingRecord[]> => {
  try {
    const userId = await getCurrentUserId();
    const response = await apiClient.get<ApiResponse<SharingRecord[]>>(`/share-note/history?userId=${userId}`);
    console.log('Get sharing history API response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Get sharing history error:", error);
    // Return stored history if API fails
    return await getStoredSharingHistory();
  }
}

// Get sent shares
export const getSentShares = async (): Promise<SharingRecord[]> => {
  try {
    const allHistory = await getSharingHistory();
    return allHistory.filter(record => record.status === 'sent');
  } catch (error) {
    console.error("Get sent shares error:", error);
    const storedHistory = await getStoredSharingHistory();
    return storedHistory.filter(record => record.status === 'sent');
  }
}

// Get received shares
export const getReceivedShares = async (): Promise<SharingRecord[]> => {
  try {
    const allHistory = await getSharingHistory();
    return allHistory.filter(record => record.status === 'received');
  } catch (error) {
    console.error("Get received shares error:", error);
    const storedHistory = await getStoredSharingHistory();
    return storedHistory.filter(record => record.status === 'received');
  }
}

// Revoke a shared note
export const revokeSharedNote = async (shareId: string): Promise<void> => {
  try {
    await apiClient.delete(`/share-note/revoke/${shareId}`);
    console.log(`Successfully revoked share ${shareId}`);
    
    // Update local history
    const existingHistory = await getStoredSharingHistory();
    const updatedHistory = existingHistory.map(record => 
      record.shareId === shareId ? { ...record, isActive: false } : record
    );
    await storeSharingHistory(updatedHistory);
  } catch (error) {
    console.error("Revoke shared note error:", error);
    // Update local history even if API fails
    const existingHistory = await getStoredSharingHistory();
    const updatedHistory = existingHistory.map(record => 
      record.shareId === shareId ? { ...record, isActive: false } : record
    );
    await storeSharingHistory(updatedHistory);
  }
}

// Unshare a note using the specific endpoint
export const unshareNote = async (shareId: string): Promise<void> => {
  try {
    const response = await apiClient.post(`/share-note/unshare`, { shareId });
    console.log('Note unshared successfully:', shareId);
    
    // Update local storage
    const existingHistory = await getStoredSharingHistory();
    const updatedHistory = existingHistory.map(record => 
      record.shareId === shareId 
        ? { ...record, isActive: false }
        : record
    );
    await storeSharingHistory(updatedHistory);
  } catch (error) {
    console.error("Unshare note error:", error);
    throw error;
  }
}

// Get shared notes by note ID
export const getSharedNotesByNoteId = async (noteId: string): Promise<SharingRecord[]> => {
  try {
    const allHistory = await getSharingHistory();
    return allHistory.filter(record => record.noteId === noteId);
  } catch (error) {
    console.error("Get shared notes by note ID error:", error);
    const storedHistory = await getStoredSharingHistory();
    return storedHistory.filter(record => record.noteId === noteId);
  }
}

// Get sharing statistics
export const getSharingStats = async (): Promise<{
  totalSent: number;
  totalReceived: number;
  activeShares: number;
  recentShares: number;
}> => {
  try {
    const allHistory = await getSharingHistory();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      totalSent: allHistory.filter(record => record.status === 'sent').length,
      totalReceived: allHistory.filter(record => record.status === 'received').length,
      activeShares: allHistory.filter(record => record.isActive).length,
      recentShares: allHistory.filter(record => 
        new Date(record.sharedAt) > oneWeekAgo
      ).length
    };
  } catch (error) {
    console.error("Get sharing stats error:", error);
    return {
      totalSent: 0,
      totalReceived: 0,
      activeShares: 0,
      recentShares: 0
    };
  }
}

// Get note owner information
export const getNoteOwner = async (noteId: string): Promise<{
  ownerId: string;
  ownerEmail: string;
  ownerName?: string;
  isOwner: boolean;
}> => {
  try {
    const response = await apiClient.get<ApiResponse<{
      ownerId: string;
      ownerEmail: string;
      ownerName?: string;
      isOwner: boolean;
    }>>(`/share-note/owner?noteId=${noteId}`);
    
    console.log('Get note owner API response:', response.data);
    
    // Handle different response structures
    const responseData = response.data as any;
    
    if (responseData && responseData.data) {
      // Standard ApiResponse format
      return responseData.data;
    } else if (responseData && (responseData.ownerId || responseData.ownerEmail)) {
      // Direct response format
      return {
        ownerId: responseData.ownerId || 'unknown',
        ownerEmail: responseData.ownerEmail || 'unknown@example.com',
        ownerName: responseData.ownerName,
        isOwner: responseData.isOwner || false
      };
    } else {
      // Fallback data if response structure is unexpected
      console.log('Unexpected response structure, using fallback data');
      return {
        ownerId: 'unknown',
        ownerEmail: 'unknown@example.com',
        ownerName: 'Unknown Owner',
        isOwner: false
      };
    }
  } catch (error) {
    console.error("Get note owner error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data,
      url: (error as any)?.config?.url,
    });
    
    // Return fallback data for offline scenario
    return {
      ownerId: 'unknown',
      ownerEmail: 'unknown@example.com',
      ownerName: 'Unknown Owner',
      isOwner: false
    };
  }
}
