"use client";

import { getNotes } from "@/api/notesApi";
import type { Note } from "@/api/types";
import FAB from "@/components/FAB";
import {
  NoteEditor,
  NotesHeader,
  NotesList,
  SearchBar
} from "@/components/notes";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const NotesScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
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

  const openNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      // Map the note to include notebookTitle for the editor
      const noteForEditor = {
        ...note,
        notebookId: note.notebookId || 'default',
        notebookTitle: 'My Notebook', // Default value, you might want to fetch actual notebook title
      };
      setEditingNote(noteForEditor);
      setEditorVisible(true);
    }
  };

  const openNoteEditor = () => {
    setEditingNote(null); // Clear any editing note
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
    setSaving(true);
    try {
      if (editingNote) {
        // Update existing note
        setNotes(prevNotes => 
          prevNotes.map(n => n.id === note.id ? note : n)
        );
      } else {
        // Add new note
        setNotes(prevNotes => [note, ...prevNotes]);
      }
      
      // Close editor
      closeNoteEditor();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
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
      <SearchBar value={searchText} onChangeText={setSearchText} />
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