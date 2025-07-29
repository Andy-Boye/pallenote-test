"use client";

import { createNote, getNotes, updateNote } from "@/api/notesApi";
import type { Note } from "@/api/types";
import FAB from "@/components/FAB";
import {
  NoteEditor,
  NotesHeader,
  NotesList,
} from "@/components/notes";
import SearchBar from "@/components/SearchBar";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";

const NotesScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { openFab } = useLocalSearchParams<{ openFab?: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [editorVisible, setEditorVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingNote, setEditingNote] = useState<{
    id: string;
    title: string;
    content: string;
    notebookId: string;
    notebookTitle: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes();
        setNotes(data as Note[]);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  // Auto-open FAB if parameter is present
  useEffect(() => {
    if (openFab === 'true') {
      // Small delay to ensure screen is fully loaded
      const timer = setTimeout(() => {
        openNoteEditor();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [openFab]);

  const openNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      // Set the editing note data and open the editor modal
      setEditingNote({
        id: note.id,
        title: note.title,
        content: note.content,
        notebookId: note.notebookId,
        notebookTitle: 'My Notebook', // Default value since Note type doesn't have notebookTitle
        date: note.date,
      });
      setEditorVisible(true);
    }
  };

  const openNoteEditor = () => {
    setEditingNote(null); // Clear any editing note for new note creation
    setEditorVisible(true);
  };
  
  const closeNoteEditor = () => {
    setEditorVisible(false);
    setEditingNote(null); // Clear editing note when closing
  };
  
  const handleSaveNote = async (note: {
    id: string;
    title: string;
    content: string;
    notebookId: string;
    notebookTitle: string;
    date: string;
  }) => {
    console.log('=== SAVING NOTE ===');
    console.log('Note data from editor:', note);
    console.log('Editing note state:', editingNote);
    setSaving(true);
    try {
      // Prepare note data for API
      const noteData = {
        title: note.title,
        content: note.content,
        notebookId: note.notebookId, // Keep the notebookId as is, including 'default'
        date: note.date,
      };
      
      console.log('Note data being sent to API:', noteData);

      if (editingNote) {
        // Update existing note via API
        console.log('Updating existing note...');
        const updatedNote = await updateNote(note.id, noteData);
        console.log('Updated note returned from API:', updatedNote);
        setNotes(prevNotes => {
          const newNotes = prevNotes.map(n => n.id === note.id ? updatedNote : n);
          console.log('Updated notes state:', newNotes);
          return newNotes;
        });
      } else {
        // Create new note via API
        console.log('Creating new note...');
        const newNote = await createNote(noteData);
        console.log('New note returned from API:', newNote);
        setNotes(prevNotes => {
          const newNotes = [newNote, ...prevNotes];
          console.log('Updated notes state after creation:', newNotes);
          return newNotes;
        });
      }
      
      console.log('=== NOTE SAVED SUCCESSFULLY ===');
      // Close editor
      closeNoteEditor();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNotebookChange = async (noteId: string, newNotebookId: string, newNotebookTitle: string) => {
    console.log('=== NOTEBOOK CHANGE HANDLER IN NOTES SCREEN ===');
    console.log('Note ID:', noteId);
    console.log('New Notebook ID:', newNotebookId);
    console.log('New Notebook Title:', newNotebookTitle);
    
    try {
      // Update the note's notebookId in the API
      await updateNote(noteId, { notebookId: newNotebookId });
      
      // Update the note in local state immediately
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId 
            ? { ...note, notebookId: newNotebookId }
            : note
        )
      );
      
      console.log('Note notebook updated successfully in notes screen');
      
      // Show success message
      Alert.alert(
        "Notebook Updated", 
        `Note moved to "${newNotebookTitle}" successfully!`,
        [{ text: "OK" }]
      );
      
    } catch (error) {
      console.error('Error updating note notebook:', error);
      Alert.alert(
        "Error", 
        "Failed to update note notebook. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <NotesHeader />
      <SearchBar 
        value={searchText} 
        onChangeText={setSearchText} 
        placeholder="Search notes..."
        onClear={() => setSearchText('')}
      />
      <NotesList 
        notes={notes} 
        onNotePress={openNote} 
        searchText={searchText} 
      />
      
      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <FAB onPress={openNoteEditor} icon="add" size={28} color={colors.success} />
      </View>

      {/* Note Editor */}
      <NoteEditor
        visible={editorVisible}
        onClose={closeNoteEditor}
        onSave={handleSaveNote}
        onNotebookChange={handleNotebookChange}
        saving={saving}
        editingNote={editingNote}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fabContainer: {
    position: 'absolute',
    right: 28,
    bottom: 36,
    zIndex: 10,
  },
});

export default NotesScreen;