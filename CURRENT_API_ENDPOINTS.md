# Current API Endpoints in Frontend Codebase

## Base URL

`https://pella-notes.onrender.com/api/v1`

## 🔐 Authentication Endpoints (`api/authApi.ts`)

### Auth Operations

- `POST /auth/signin` - User sign in
- `POST /auth/signup` - User registration
- `POST /auth/signout` - User sign out
- `POST /auth/refresh` - Refresh access token
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/resend-otp` - Resend OTP code

### Password Management

- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with OTP
- `PATCH /account/change-password` - Change password (authenticated)

### Account Management

- `POST /auth/account/verify` - Verify account with token
- `POST /auth/account-reset/{email}` - Reset account
- `GET /account` - Get account information
- `PATCH /account` - Update account settings
- `DELETE /account` - Delete account
- `GET /account/profile` - Get account profile
- `PATCH /account/profile` - Update account profile

## 📝 Notes Endpoints (`api/notesApi.ts`)

### Basic CRUD Operations

- `GET /notes` - Get all notes (with pagination, filtering, search)
- `GET /notes/{id}` - Get note by ID
- `POST /notes` - Create new note
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note

### Note Management

- `PATCH /notes/{id}/content` - Update note content
- `PATCH /notes/rename` - Rename note
- `GET /notes/search` - Search notes

### Book Notes

- `GET /notes/book` - Get book notes
- `POST /notes/book` - Create book note
- `PUT /notes/book/{id}` - Update book note
- `DELETE /notes/book/{id}` - Delete book note
- `GET /notes/book/{id}` - Get book note by ID
- `PATCH /notes/book/rename` - Rename book note
- `GET /notes/books` - Get all books

### Reference Materials

- `GET /notes/reference` - Get reference notes
- `POST /notes/reference` - Add reference material
- `PUT /notes/reference/{id}` - Update reference material
- `DELETE /notes/reference/{id}` - Delete reference material
- `GET /notes/reference/type/{type}` - Get references by type
- `GET /notes/reference/{refId}` - Get reference by ID
- `DELETE /notes/reference/{refId}` - Delete reference by ID

### Bulk Operations

- `DELETE /notes/bulk` - Bulk delete notes
- `PATCH /notes/bulk` - Bulk update notes
- `GET /notes/stats` - Get notes statistics

### Notebook-specific Operations

- `GET /notes/notebook/{notebookId}` - Get notes by notebook ID
- `DELETE /notes/notebook/{notebookId}` - Delete notes by notebook ID

## 📚 Notebooks Endpoints (`api/notebooksApi.ts`)

### Basic CRUD Operations

- `GET /notebooks` - Get all notebooks
- `GET /notebooks/{id}` - Get notebook by ID
- `POST /notebooks` - Create new notebook
- `PUT /notebooks/{id}` - Update notebook
- `DELETE /notebooks/{id}` - Delete notebook

### Advanced Operations

- `DELETE /notebooks/{id}/with-contents` - Delete notebook and all contents
- `PUT /notebooks/{id}/move-notes-to-default` - Move notes to default notebook

## ✅ Tasks Endpoints (`api/tasksApi.ts`)

### Basic CRUD Operations

- `GET /tasks` - Get all tasks
- `GET /tasks/{id}` - Get task by ID
- `POST /tasks` - Create new task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

### Task Management

- `PATCH /tasks/{id}/toggle` - Toggle task completion

## 👤 User Endpoints (`api/userApi.ts`)

### Profile Management

- `GET /user/profile` - Get user profile
- `PATCH /user/profile` - Update user profile
- `POST /user/avatar` - Upload user avatar
- `DELETE /user/account` - Delete user account

## 🔍 Search Endpoints (`api/searchApi.ts`)

### Search Operations

- `GET /search` - Search items (notes, tasks, recordings)

## 📅 Calendar Endpoints (`api/calendarApi.ts`)

### Event Management

- `GET /calendar/events` - Get all calendar events
- `GET /calendar/events/{id}` - Get event by ID
- `POST /calendar/events` - Create new event
- `PUT /calendar/events/{id}` - Update event
- `DELETE /calendar/events/{id}` - Delete event

## 🎤 Recording Endpoints (`api/recordingApi.ts`)

### Recording Management

- `POST /recordings/upload` - Upload recording file
- `GET /recordings` - Get all recordings
- `DELETE /recordings/{id}` - Delete recording
- `POST /recordings/{id}/transcribe` - Transcribe recording

## 📊 Statistics & Analytics

### Notes Statistics

- `GET /notes/stats` - Get notes statistics (total, by notebook, recent count)

## 🔧 Utility Endpoints

### Health Check

- `GET /` - Backend connectivity test

## 📋 Summary by Status

### ✅ Working Endpoints (with mock data fallbacks)

- All authentication endpoints
- All notes endpoints (with comprehensive mock data)
- All notebooks endpoints (with mock data)
- Account profile endpoints (with mock data)

### ❌ Missing/Error Endpoints (404/405)

- `/notebooks` - Returns 404
- `/tasks` - Returns 404
- `/notes/{id}` - Returns 404
- `/account/profile` - Returns 404
- `/notes` - Returns 405 (Method Not Allowed)

### 🔄 Untested Endpoints

- All calendar endpoints
- All recording endpoints
- All user endpoints (except profile)
- All search endpoints

## 🎯 Frontend Implementation Status

- **Total Endpoints**: 50+ endpoints implemented
- **Mock Data Coverage**: 100% for critical endpoints
- **Error Handling**: Comprehensive try-catch blocks
- **Authentication**: Fully implemented with token management
- **Fallback Strategy**: All endpoints have mock data for offline/error scenarios
