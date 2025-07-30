# Note Sharing Guide

This guide explains how to use the note sharing functionality in the Pallenote app.

## Overview

The note sharing feature allows users to share their notes with others by providing them with access to view or edit the note. The sharing is done through email invitations and generates shareable URLs.

## JSON Structure

The note sharing API expects the following JSON structure:

```json
{
    "recipientEmail": "kendrickarthur9@gmail.com",
    "accessType": "Viewer",   // possible values are [Viewer, Editor]
    "noteId": 2
}
```

### Parameters

- **recipientEmail** (string): The email address of the person you want to share the note with
- **accessType** (string): The type of access to grant
  - `"Viewer"`: The recipient can only view the note
  - `"Editor"`: The recipient can view and edit the note
- **noteId** (number): The ID of the note to share

## API Function

The sharing functionality is implemented in the `shareNote` function in `api/notesApi.ts`:

```typescript
export const shareNote = async (noteId: number, shareData: {
  recipientEmail: string;
  accessType: 'Viewer' | 'Editor';
}): Promise<{ shareUrl: string; shareId: string }>
```

### Usage Example

```typescript
import { shareNote } from '@/api/notesApi';

const handleShare = async () => {
  try {
    const result = await shareNote(2, {
      recipientEmail: "kendrickarthur9@gmail.com",
      accessType: "Viewer"
    });
    
    console.log('Share URL:', result.shareUrl);
    console.log('Share ID:', result.shareId);
  } catch (error) {
    console.error('Error sharing note:', error);
  }
};
```

## UI Components

### ShareNoteModal

A modal component that provides a user-friendly interface for sharing notes:

- **Location**: `components/ShareNoteModal.tsx`
- **Features**:
  - Email input validation
  - Access type selection (Viewer/Editor)
  - Loading states
  - Success/error handling
  - Share URL display

### Integration Points

The share functionality is integrated in the following places:

1. **RichNoteCard**: Share button in note cards
2. **Note Detail Screen**: Share button in note detail view
3. **Notes List**: Share functionality in the notes list

## How to Use

### 1. From Note Cards

1. Tap the share icon on any note card
2. Enter the recipient's email address
3. Select access type (Viewer or Editor)
4. Tap "Share Note"
5. The recipient will receive a shareable URL

### 2. From Note Detail Screen

1. Open a note
2. Tap the "Share" button
3. Follow the same steps as above

### 3. Programmatically

```typescript
// Direct API call
const shareData = {
  recipientEmail: "user@example.com",
  accessType: "Viewer" as const
};

const result = await shareNote(123, shareData);
```

## Response Format

The API returns:

```typescript
{
  shareUrl: string;    // URL that can be shared with the recipient
  shareId: string;     // Unique identifier for the share
}
```

## Error Handling

The system handles various error scenarios:

- Invalid email format
- Network connectivity issues
- Invalid note ID
- Server errors

All errors are displayed to the user with appropriate messages.

## Testing

A test component is available at `components/ShareNoteTest.tsx` that allows you to:

- Test different note IDs
- Test different email addresses
- Test both access types
- See the JSON structure being sent
- Verify the API response

## Security Considerations

- Email validation is performed on both client and server
- Access types are strictly validated
- Share URLs are generated with unique identifiers
- Recipients must have valid email addresses

## Future Enhancements

Potential improvements for the sharing feature:

1. **Share History**: Track all shared notes
2. **Revoke Access**: Remove sharing permissions
3. **Expiration Dates**: Set time limits on shared access
4. **Password Protection**: Add optional password to shared notes
5. **Bulk Sharing**: Share multiple notes at once
6. **Share Analytics**: Track who accessed shared notes

## Troubleshooting

### Common Issues

1. **"Invalid email format"**
   - Ensure the email contains an @ symbol
   - Check for proper email format

2. **"Note not found"**
   - Verify the note ID exists
   - Check if you have permission to share the note

3. **"Network error"**
   - Check internet connectivity
   - Try again after a few seconds

4. **"Share failed"**
   - Verify the recipient email is correct
   - Check if the note is accessible

### Debug Information

Enable console logging to see detailed information:

```typescript
console.log('Sharing note with data:', {
  noteId: 2,
  recipientEmail: "user@example.com",
  accessType: "Viewer"
});
```

## API Endpoints

The sharing functionality uses the following endpoint:

- **POST** `/share-note/share`
  - Body: `{ recipientEmail, accessType, noteId }`
  - Response: `{ shareUrl, shareId }`

## Mock Data

When the API is unavailable, the system returns mock data:

```typescript
{
  shareUrl: "https://pella-notes.onrender.com/shared-note/2",
  shareId: "share_1234567890"
}
```

This ensures the app continues to work even in offline scenarios. 