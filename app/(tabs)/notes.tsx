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
    router.push(`/notes/${noteId}`);
  };

  const openNoteEditor = () => {
    setEditorVisible(true);
  };
  
  const closeNoteEditor = () => setEditorVisible(false);
  
  const handleSaveNote = async (newNote: {
    id: string;
    title: string;
    content: string;
    notebookId: string;
    notebookTitle: string;
    date: string;
  }) => {
    setSaving(true);
    try {
      // Add to notes array
      setNotes(prevNotes => [newNote, ...prevNotes]);
      
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