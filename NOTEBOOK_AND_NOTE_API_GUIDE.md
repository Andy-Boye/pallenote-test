# Notebook and Note API Guide

## Overview

The notebook and note APIs provide a complete system for managing user notes and notebooks. The system includes user association, filtering, search, and comprehensive CRUD operations.

## Data Models

### Notebook Structure

```typescript
interface Notebook {
  id: string; // Unique identifier
  title: string; // Notebook name
  ownerId: string; // User who owns the notebook
  isDefault: boolean; // Whether this is the default notebook
  createdAt: string; // Creation timestamp
  updatedAt?: string; // Last update timestamp
}
```

### Note Structure

```typescript
interface Note {
  id: string; // Unique identifier
  title: string; // Note title
  content: string; // Note content
  notebookId: string; // Which notebook it belongs to
  date: string; // Date string
  userId: string; // User who owns the note
  createdAt: string; // Creation timestamp
  updatedAt?: string; // Last update timestamp
}
```

## Notebook API Functions

### 1. Get All Notebooks

```typescript
getNotebooks(): Promise<Notebook[]>
```

- **Purpose**: Retrieve all notebooks for the current user
- **User Filtering**: Automatically filters by `userId` from AsyncStorage
- **Mock Data**: Returns 4 default notebooks if backend fails
- **Usage**: Used in notebooks list screen

### 2. Get Notebook by ID

```typescript
getNotebookById(id: string): Promise<Notebook>
```

- **Purpose**: Get specific notebook details
- **Parameters**: Notebook ID
- **Usage**: Used when viewing notebook details

### 3. Create Notebook

```typescript
createNotebook(notebook: Omit<Notebook, "id" | "noteCount" | "createdAt" | "updatedAt">): Promise<Notebook>
```

- **Purpose**: Create a new notebook
- **User Association**: Automatically adds `ownerId` from current user
- **Mock Data**: Returns mock notebook with generated ID
- **Usage**: Used in create notebook modal

### 4. Update Notebook

```typescript
updateNotebook(id: string, notebook: Partial<Notebook>): Promise<Notebook>
```

- **Purpose**: Update notebook properties
- **Parameters**: Notebook ID and partial update data

### 5. Delete Notebook

```typescript
deleteNotebook(id: string): Promise<void>
```

- **Purpose**: Delete a notebook
- **Parameters**: Notebook ID

## Note API Functions

### 1. Get Notes (Main Function)

```typescript
getNotes(params?: {
  page?: number;
  limit?: number;
  notebookId?: string;
  search?: string;
}): Promise<Note[]>
```

- **Purpose**: Retrieve notes with filtering and pagination
- **Parameters**:
  - `page`: Page number for pagination
  - `limit`: Number of notes per page
  - `notebookId`: Filter by specific notebook
  - `search`: Search in note titles and content
- **User Filtering**: Automatically adds `userId` to query
- **Mock Data**: Returns 7 notes distributed across notebooks
- **Usage**: Used in notes list and notebook detail screens

### 2. Create Note

```typescript
createNote(note: Omit<Note, "id" | "createdAt" | "updatedAt"> & {
  noteBookId?: number;
}): Promise<Note>
```

- **Purpose**: Create a new note
- **User Association**: Automatically adds `userId` from current user
- **Mock Data**: Returns mock note with generated ID
- **Usage**: Used in create note screen

### 3. Update Note

```typescript
updateNote(id: string, note: Partial<Note>): Promise<Note>
```

- **Purpose**: Update note properties
- **Parameters**: Note ID and partial update data

### 4. Delete Note

```typescript
deleteNote(id: string): Promise<void>
```

- **Purpose**: Delete a specific note
- **Parameters**: Note ID

## Specialized Note Functions

### Book Notes

```typescript
createBookNote(bookData: {
  title: string;
  content: string;
  author?: string;
  genre?: string;
  isbn?: string;
}): Promise<Note>

getBookNotes(): Promise<Note[]>
```

- **Purpose**: Handle book-specific notes with metadata
- **Usage**: For book reviews and reading notes

### Reference Materials

```typescript
addReferenceMaterial(referenceData: {
  noteId: number;
  reference: string;
  refMaterial: string;
  fileType: 'Audio' | 'Video' | 'Pdf' | 'Image';
}): Promise<Note>

getReferenceNotesByType(fileType: 'Audio' | 'Video' | 'Pdf' | 'Image'): Promise<Note[]>
```

- **Purpose**: Add file references to notes
- **Usage**: For attaching documents, images, etc.

### Bulk Operations

```typescript
bulkDeleteNotes(noteIds: string[]): Promise<void>
bulkUpdateNotes(updates: Array<{
  id: string;
  title?: string;
  content?: string;
  notebookId?: string;
}>): Promise<Note[]>
```

- **Purpose**: Perform operations on multiple notes
- **Usage**: For batch editing and deletion

## User Association System

### How User Filtering Works

1. **Get Current User ID**: `getCurrentUserId()` retrieves user ID from AsyncStorage
2. **Add to Requests**: User ID is automatically added to API requests
3. **Mock Data**: Mock data includes `userId` field for consistency

### Example Flow

```typescript
// When getting notes
const userId = await getCurrentUserId(); // "user123"
const response = await apiClient.get(`/notes?userId=${userId}`);

// When creating a note
const noteWithUser = { ...note, userId: userId };
const response = await apiClient.post("/notes", noteWithUser);
```

## Mock Data Structure

### Default Notebooks

```typescript
[
  { id: "default", title: "My Notebook", ownerId: userId, isDefault: true },
  { id: "work", title: "Work Notes", ownerId: userId, isDefault: false },
  {
    id: "personal",
    title: "Personal Notes",
    ownerId: userId,
    isDefault: false,
  },
  { id: "ideas", title: "Ideas & Projects", ownerId: userId, isDefault: false },
];
```

### Sample Notes Distribution

```typescript
[
  { id: "1", title: "Welcome Note", notebookId: "default", userId: userId },
  { id: "2", title: "Getting Started", notebookId: "default", userId: userId },
  { id: "3", title: "Meeting Notes", notebookId: "work", userId: userId },
  { id: "4", title: "Ideas for App", notebookId: "ideas", userId: userId },
  { id: "5", title: "Shopping List", notebookId: "personal", userId: userId },
  { id: "6", title: "Travel Plans", notebookId: "personal", userId: userId },
  { id: "7", title: "Reading List", notebookId: "ideas", userId: userId },
];
```

## API Endpoints

### Notebook Endpoints

- `GET /notebooks?userId={userId}` - Get user's notebooks
- `GET /notebooks/{id}` - Get specific notebook
- `POST /notebooks` - Create notebook
- `PUT /notebooks/{id}` - Update notebook
- `DELETE /notebooks/{id}` - Delete notebook

### Note Endpoints

- `GET /notes?userId={userId}&notebookId={notebookId}&search={search}` - Get notes
- `GET /notes/{id}` - Get specific note
- `POST /notes` - Create note
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note

### Special Endpoints

- `GET /notes/book` - Get book notes
- `POST /notes/book` - Create book note
- `GET /notes/reference` - Get reference materials
- `POST /notes/reference` - Add reference material

## Error Handling

### Network Errors

- All functions have mock data fallbacks
- Comprehensive error logging
- Graceful degradation when backend is unavailable

### User Association Errors

- Functions check for user ID before making requests
- Clear error messages when user not found
- Mock data includes proper user association

## Usage Examples

### Getting Notes for a Notebook

```typescript
// Get all notes for "work" notebook
const workNotes = await getNotes({ notebookId: "work" });

// Get notes with search
const searchResults = await getNotes({
  search: "meeting",
  notebookId: "work",
});
```

### Creating a Note

```typescript
const newNote = await createNote({
  title: "My New Note",
  content: "This is the content of my note",
  notebookId: "work",
  date: "2024-01-20",
});
```

### Creating a Notebook

```typescript
const newNotebook = await createNotebook({
  title: "Project Notes",
  isDefault: false,
});
```

## Integration with UI

### Notebook List Screen

- Uses `getNotebooks()` to display all notebooks
- Shows notebook count and creation date
- Handles empty state and loading

### Note List Screen

- Uses `getNotes()` to display notes
- Supports filtering by notebook
- Includes search functionality

### Notebook Detail Screen

- Uses `getNotes({ notebookId })` to show notes in specific notebook
- Shows notebook title and note count
- Allows creating new notes in that notebook

## Best Practices

1. **Always check user authentication** before making API calls
2. **Use mock data fallbacks** for development and offline scenarios
3. **Include proper error handling** for network failures
4. **Filter by user** to ensure data privacy
5. **Use appropriate loading states** during API calls
6. **Validate input data** before sending to API

This system provides a robust foundation for note-taking with proper user isolation, comprehensive CRUD operations, and graceful error handling.
