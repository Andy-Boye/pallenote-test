import { getNotes, updateNote } from "@/api/notesApi"
import { useTheme } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native"
import type { Note } from "../../api/types"
import DarkGradientBackground from '../../components/DarkGradientBackground'
import NoteEditor from "../../components/notes/NoteEditor"

const NotesScreen = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [editorVisible, setEditorVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingNote, setEditingNote] = useState<{
    id: string;
    title: string;
    content: string;
    notebookId: string;
    notebookTitle: string;
    date: string;
  } | null>(null)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes()
        setNotes(data)
      } catch (error) {
        console.error("Failed to load notes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

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
    setSaving(true);
    try {
      // Prepare note data for API
      const noteData = {
        title: note.title,
        content: note.content,
        notebookId: note.notebookId,
        date: note.date,
      };
      
      if (editingNote) {
        // Update existing note via API
        const updatedNote = await updateNote(note.id, noteData);
        setNotes(prevNotes => prevNotes.map(n => n.id === note.id ? updatedNote : n));
      } else {
        // For new notes, you might want to handle this differently
        // For now, we'll just close the editor
        Alert.alert("Info", "Please use the main notes screen to create new notes.");
      }
      
      closeNoteEditor();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert("Error", "Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleNotebookChange = async (noteId: string, newNotebookId: string, newNotebookTitle: string) => {
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
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <DarkGradientBackground>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {notes.map((note) => (
          <TouchableOpacity
            key={note.id}
            onPress={() => openNote(note.id)}
            className="mb-4 p-4 rounded-2xl"
            style={{ backgroundColor: colors.card }}
          >
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              {note.title}
            </Text>
            <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              {note.date}
            </Text>
          </TouchableOpacity>
        ))}

        {notes.length === 0 && (
          <Text className="text-center mt-12 text-base" style={{ color: colors.textSecondary }}>
            No notes found. Tap + to create your first note.
          </Text>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.push("../notes/new")}
        className="absolute bottom-6 right-6 p-4 rounded-full shadow-lg"
        style={{ backgroundColor: colors.primary }}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Note Editor Modal */}
      <NoteEditor
        visible={editorVisible}
        onClose={closeNoteEditor}
        onSave={handleSaveNote}
        onNotebookChange={handleNotebookChange}
        saving={saving}
        editingNote={editingNote}
      />
    </DarkGradientBackground>
  )
}

export default NotesScreen
