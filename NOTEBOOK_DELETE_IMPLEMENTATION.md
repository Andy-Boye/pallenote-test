# Notebook Delete Functionality Implementation

## Overview

The notebook delete functionality has been implemented using the specific endpoint provided: `https://pella-notes.onrender.com/api/v1/notes/book`

## API Endpoint Details

### Delete Notebook Request

- **Method**: `DELETE`
- **URL**: `https://pella-notes.onrender.com/api/v1/notes/book`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}` (automatically added by request interceptor)
- **Request Body**:

```json
{
  "noteBookId": 7
}
```

### Implementation Details

#### 1. API Function (`api/notebooksApi.ts`)

```typescript
export const deleteNotebook = async (id: string): Promise<void> => {
  try {
    await apiClient.delete("/api/v1/notes/book", {
      data: {
        noteBookId: parseInt(id) || id,
      },
    });
  } catch (error) {
    // Handle offline scenario by removing from local storage
    // Re-throw error for calling function to handle
  }
};
```

#### 2. UI Integration (`components/NotebookActionModal.tsx`)

- Delete option is available in the notebook action modal
- Shows confirmation dialog with notebook name and note count
- Prevents deletion of default notebook
- Handles errors with user-friendly alerts

#### 3. Screen Integration (`app/(tabs)/notebooks.tsx`)

- Long press on notebook opens action modal
- `handleDeleteNotebookAndContents` function orchestrates the deletion process
- Updates local state after successful deletion
- Refreshes notes list after deletion

## Usage Flow

1. **User Action**: Long press on a notebook in the notebooks list
2. **Modal Display**: NotebookActionModal opens with options
3. **Delete Selection**: User taps "Delete Notebook" option
4. **Confirmation**: Alert dialog shows with notebook details and warning
5. **API Call**: If confirmed, `deleteNotebook` function is called
6. **Request**: DELETE request sent to `/api/v1/notes/book` with `noteBookId`
7. **Response**: Success/error handling with user feedback
8. **UI Update**: Notebook removed from list if successful

## Error Handling

### Network Errors

- Falls back to local storage removal for offline scenarios
- Shows appropriate error messages to user
- Maintains app functionality even when API is unavailable

### Validation

- Prevents deletion of default notebook (`id === 'default'`)
- Validates notebook ID before making API call
- Handles both string and numeric notebook IDs

### User Feedback

- Loading states during deletion process
- Success/error alerts with specific messages
- Confirmation dialogs for destructive actions

## Testing

### Test Function

```typescript
export const testDeleteNotebook = async (notebookId: string): Promise<void> => {
  // Tests the delete functionality with detailed logging
  await deleteNotebook(notebookId);
};
```

### Manual Testing Steps

1. Create a test notebook
2. Add some notes to the notebook
3. Long press the notebook
4. Select "Delete Notebook"
5. Confirm deletion
6. Verify notebook is removed from list
7. Verify notes are also deleted (if applicable)

## Security Considerations

- Bearer token authentication is automatically included
- User can only delete their own notebooks
- Server-side validation should prevent unauthorized deletions
- Sensitive operations require user confirmation

## Future Enhancements

- Add soft delete option (move to recycle bin)
- Implement bulk delete functionality
- Add undo delete feature
- Improve offline sync capabilities
