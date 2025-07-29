"use client";

import { getNotebookById } from "@/api/notebooksApi";
import { createNote, getNotes, updateNote } from "@/api/notesApi";
import type { Note, Notebook } from "@/api/types";
import FAB from "@/components/FAB";
import {
    NoteEditor,
    NotesList
} from "@/components/notes";
import SearchBar from "@/components/SearchBar";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DarkGradientBackground from '../../../components/DarkGradientBackground';

export default function NotebookDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { notebookId } = useLocalSearchParams<{ notebookId: string }>();

  const [notes, setNotes] = useState<Note[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [notebook, setNotebook] = useState<Notebook | null>(null);
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

  console.log('=== NOTEBOOK DETAIL SCREEN RENDERED ===');
  console.log('notebookId from params:', notebookId);
  console.log('loading state:', loading);

  useEffect(() => {
    console.log('=== USE EFFECT TRIGGERED ===');
    console.log('notebookId in useEffect:', notebookId);
    
    if (!notebookId) {
      console.log('No notebookId provided, showing error state');
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        console.log('Starting to fetch data...');
        console.log('Fetching notes for notebookId:', notebookId);
        setLoading(true);
        
        // Get notes with notebook filtering
        const notesData = await getNotes({ notebookId });
        console.log('Raw notes data returned:', notesData);
        console.log('Notes data length:', notesData.length);
        
        const notebookData = notebookId !== 'default' 
          ? await getNotebookById(notebookId) 
          : { id: 'default', title: 'My Notebook', ownerId: 'current-user-id', isDefault: true, createdAt: new Date().toISOString() };
        
        setAllNotes(notesData);
        setNotebook(notebookData);
        setNotes(notesData); // Notes are already filtered by notebookId
        
        console.log('=== NOTEBOOK DETAIL SCREEN DATA LOADED ===');
        console.log('NotebookDetailScreen - Loaded notes for notebook:', notesData);
        console.log('NotebookDetailScreen - Notebook:', notebookData);
        console.log('NotebookDetailScreen - Notes count:', notesData.length);
        console.log('NotebookDetailScreen - Notes details:', notesData.map(n => ({ id: n.id, title: n.title, notebookId: n.notebookId })));
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [notebookId]);

  const openNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      // Navigate to the note detail screen instead of opening the editor modal
      router.push(`/notes/${noteId}`);
    }
  };

  const openNoteEditor = () => {
    setEditingNote(null);
    setEditorVisible(true);
  };
  
  const closeNoteEditor = () => {
    setEditorVisible(false);
    setEditingNote(null);
  };
  
  const handleSaveNote = async (note: {
    id: string;
    title: string;
    content: string;
    notebookId: string;
    notebookTitle: string;
    date: string;
  }) => {
    console.log('=== SAVING NOTE IN NOTEBOOK ===');
    console.log('Note data from editor:', note);
    console.log('Current notebookId:', notebookId);
    
    setSaving(true);
    try {
      const noteData = {
        title: note.title,
        content: note.content,
        notebookId: notebookId, // Always use the current notebook ID
        date: note.date,
      };
      
      console.log('Note data being sent to API:', noteData);

      if (editingNote) {
        // Update existing note
        console.log('Updating existing note...');
        const updatedNote = await updateNote(note.id, noteData);
        console.log('Updated note returned from API:', updatedNote);
        
        // Update both allNotes and filtered notes
        setAllNotes(prevNotes => prevNotes.map(n => n.id === note.id ? updatedNote : n));
        setNotes(prevNotes => prevNotes.map(n => n.id === note.id ? updatedNote : n));
      } else {
        // Create new note
        console.log('Creating new note...');
        const newNote = await createNote(noteData);
        console.log('New note returned from API:', newNote);
        
        // Add to both allNotes and filtered notes
        setAllNotes(prevNotes => [newNote, ...prevNotes]);
        setNotes(prevNotes => [newNote, ...prevNotes]);
      }
      
      console.log('=== NOTE SAVED SUCCESSFULLY ===');
      console.log('Updated notes count:', notes.length + 1);
      closeNoteEditor();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  // Function to refresh notes from API
  const refreshNotes = async () => {
    if (!notebookId) return;
    
    try {
      console.log('Refreshing notes for notebook:', notebookId);
      const notesData = await getNotes({ notebookId });
      console.log('Refreshed notes data:', notesData);
      
      setAllNotes(notesData);
      setNotes(notesData);
    } catch (error) {
      console.error('Error refreshing notes:', error);
    }
  };

  const handleNotebookChange = async (noteId: string, newNotebookId: string, newNotebookTitle: string) => {
    console.log('=== NOTEBOOK CHANGE HANDLER ===');
    console.log('Note ID:', noteId);
    console.log('New Notebook ID:', newNotebookId);
    console.log('New Notebook Title:', newNotebookTitle);
    console.log('Current notebookId:', notebookId);
    
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
      
      // Update allNotes as well
      setAllNotes(prevAllNotes => 
        prevAllNotes.map(note => 
          note.id === noteId 
            ? { ...note, notebookId: newNotebookId }
            : note
        )
      );
      
      console.log('Note notebook updated successfully');
      
      // If the note is moved to a different notebook, remove it from current view
      if (newNotebookId !== notebookId) {
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
        console.log('Note removed from current notebook view');
        
        // Show success message
        Alert.alert(
          "Note Moved", 
          `Note moved to "${newNotebookTitle}" successfully!`,
          [{ text: "OK" }]
        );
      } else {
        // Show success message for same notebook
        Alert.alert(
          "Notebook Updated", 
          `Note assigned to "${newNotebookTitle}" successfully!`,
          [{ text: "OK" }]
        );
      }
      
    } catch (error) {
      console.error('Error updating note notebook:', error);
      Alert.alert(
        "Error", 
        "Failed to update note notebook. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const goBack = () => {
    router.back();
  };

  if (!notebookId) {
    console.log('Rendering error state - no notebookId');
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontSize: 18, textAlign: 'center' }}>
          No notebook selected
        </Text>
        <TouchableOpacity onPress={goBack} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    console.log('Rendering loading state...');
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Loading notebook...</Text>
      </View>
    );
  }

  console.log('Rendering main content...');
  console.log('notes count:', notes.length);
  console.log('notebook:', notebook);

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {notebook?.title || 'Notebook'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
      </Text>
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar 
        value={searchText} 
        onChangeText={setSearchText} 
        placeholder="Search notes in this notebook..."
        onClear={() => setSearchText('')}
      />

      {/* Notes List */}
      <NotesList 
        notes={notes} 
        onNotePress={openNote} 
        searchText={searchText} 
      />
      
      {/* Floating Action Button */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + 20 }]}>
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
    </DarkGradientBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  fabContainer: {
    position: 'absolute',
    right: 28,
    zIndex: 10,
  },
});
