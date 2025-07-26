# Notes Components

This directory contains modular components for the Notes functionality in the PalleNote app.

## Components

### Core Components

- **NotesHeader** - Header section with title and subtitle
- **SearchBar** - Search input for filtering notes
- **NoteCard** - Individual note card component
- **NotesList** - FlatList component that renders the list of notes with filtering
- **NoteEditor** - Full-screen modal editor for creating/editing notes

### Editor Components

- **EditorToolbar** - Formatting toolbar with text formatting options
- **InsertPanel** - Modal panel for inserting various content types
- **FormatPanel** - Modal panel for text formatting options

## Usage

```tsx
import {
  NotesHeader,
  SearchBar,
  NotesList,
  NoteEditor
} from "@/components/notes";

// In your component
<NotesHeader />
<SearchBar value={searchText} onChangeText={setSearchText} />
<NotesList
  notes={notes}
  onNotePress={handleNotePress}
  searchText={searchText}
/>
<NoteEditor
  visible={editorVisible}
  onClose={handleClose}
  onSave={handleSave}
  saving={saving}
/>
```

## Features

- **Modular Design**: Each component is self-contained and reusable
- **Theme Support**: All components use the app's theme context
- **TypeScript**: Full type safety with proper interfaces
- **Responsive**: Components adapt to different screen sizes
- **Accessibility**: Proper accessibility features included

## Props

Each component accepts specific props for customization. See individual component files for detailed prop interfaces.
