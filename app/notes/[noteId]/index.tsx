import { getNotebooks } from "@/api/notebooksApi";
import { deleteNoteWithBody, getNoteById, updateNote } from "@/api/notesApi";
import type { Note, Notebook } from "@/api/types";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DarkGradientBackground from '../../../components/DarkGradientBackground';
import FAB from "../../../components/FAB";
import RichTextEditor from "../../../components/RichTextEditor";
import NoteEditor from "../../../components/notes/NoteEditor";


const NoteDetailScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { noteId, fromNotebook } = useLocalSearchParams<{ noteId: string; fromNotebook?: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [notebookDropdownVisible, setNotebookDropdownVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alignment: 'left' as 'left' | 'center' | 'right',
  });
  const pellEditorRef = useRef<any>(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!noteId) return;
    setLoading(true);
    getNoteById(noteId)
      .then((data) => {
        setNote(data as Note);
        setEditedTitle(data.title);
        setEditedContent(data.content);
        setLoading(false);
      })
      .catch(() => {
        setNote(null);
        setLoading(false);
      });
  }, [noteId]);

  // Load notebooks when component mounts
  useEffect(() => {
    const loadNotebooks = async () => {
      try {
        const data = await getNotebooks();
        const defaultNotebook = { id: 'default', title: 'My Notebook' } as Notebook;
        const allNotebooks = [defaultNotebook, ...data];
        setNotebooks(allNotebooks);
        
        // Set selected notebook based on note's notebookId
        if (note) {
          const currentNotebook = allNotebooks.find(nb => nb.id === note.notebookId) || defaultNotebook;
          setSelectedNotebook(currentNotebook);
        }
      } catch (error) {
        console.error('Error loading notebooks:', error);
      }
    };
    
    if (note) {
      loadNotebooks();
    }
  }, [note]);

  const handleDelete = async () => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              // Convert noteId to number for the API
              const noteIdNumber = parseInt(noteId);
              if (isNaN(noteIdNumber)) {
                throw new Error("Invalid note ID");
              }
              
              await deleteNoteWithBody(noteIdNumber);
              
              Alert.alert("Success", "Note deleted successfully.");
              // Navigate to the notebook screen instead of notes tab
              if (note?.notebookId && note.notebookId !== 'default') {
                router.replace(`/notebooks/${note.notebookId}` as any);
              } else {
                router.replace("/(tabs)/notes");
              }
            } catch (error) {
              console.error("Error deleting note:", error);
              Alert.alert("Error", "Failed to delete note. Please try again.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!editedTitle.trim() || !editedContent.trim()) {
      Alert.alert("Validation", "Please enter both a title and content for your note.");
      return;
    }
    
    try {
      // Update the note via API
      const updatedNote = await updateNote(noteId, {
        title: editedTitle.trim(),
        content: editedContent.trim(),
      });
      
      // Update local state
      setNote(updatedNote);
      Alert.alert("Success", "Note updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating note:", error);
      Alert.alert("Error", "Failed to update note. Please try again.");
    }
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const handleBackNavigation = () => {
    // Simply go back to the previous screen
    router.back();
  };

  const handleEditNote = () => {
    // Open the NoteEditor modal with the current note data
    setEditorVisible(true);
  };

  const handleCloseEditor = () => {
    setEditorVisible(false);
  };

  const handleSaveNote = async (noteData: {
    id: string;
    title: string;
    content: string;
    notebookId: string;
    notebookTitle: string;
    date: string;
  }) => {
    setSaving(true);
    try {
      // Update the note via API
      const updatedNote = await updateNote(noteId, {
        title: noteData.title,
        content: noteData.content,
        notebookId: noteData.notebookId,
      });
      
      // Update local state
      setNote(updatedNote);
      Alert.alert("Success", "Note updated successfully!");
      setEditorVisible(false);
    } catch (error) {
      console.error("Error updating note:", error);
      Alert.alert("Error", "Failed to update note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleNotebookChange = async (noteId: string, newNotebookId: string, newNotebookTitle: string) => {
    try {
      // Update the note's notebookId in the API
      await updateNote(noteId, { notebookId: newNotebookId });
      
      // Update local state
      setNote(prev => prev ? { ...prev, notebookId: newNotebookId } : null);
      
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
      <DarkGradientBackground>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Loading note...</Text>
        </View>
      </DarkGradientBackground>
    );
  }

  if (!note) {
    return (
      <DarkGradientBackground>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, marginTop: 16, fontSize: 16 }}>Note not found</Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.primary, marginTop: 24 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </DarkGradientBackground>
    );
  }

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEditing ? 'Edit Note' : 'Note Details'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {isEditing ? 'Update your thoughts' : 'View and manage your note'}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleBackNavigation} style={[styles.backButton, { backgroundColor: colors.primary }]}> 
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setMenuVisible(true)} 
            style={[styles.menuButton, { backgroundColor: colors.surface }]}
          > 
            <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.menuOverlay} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.menuItem, deleting && { opacity: 0.5 }]}
              onPress={() => {
                setMenuVisible(false);
                handleDelete();
              }}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              )}
              <Text style={[styles.menuItemText, { color: colors.error }]}>
                {deleting ? 'Deleting...' : 'Delete Note'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleShare();
              }}
            >
              <Ionicons name="share-social-outline" size={20} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Notebook Selector */}
      <View style={styles.notebookSelectorContainer}>
        <Pressable
          onPress={() => setNotebookDropdownVisible(true)}
          style={[styles.notebookSelector, { borderBottomColor: colors.border }]}
        >
          <Ionicons 
            name="book-outline" 
            size={18} 
            color={selectedNotebook ? colors.primary : colors.textSecondary} 
            style={{ marginRight: 8 }} 
          />
          <Text style={{ 
            color: selectedNotebook ? colors.primary : colors.textSecondary, 
            fontSize: 15, 
            marginRight: 6,
            fontWeight: selectedNotebook ? '600' : '400'
          }}>
            {selectedNotebook ? selectedNotebook.title : 'My Notebook'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={selectedNotebook ? colors.primary : colors.textSecondary} />
        </Pressable>
      </View>

      {/* Notebook Dropdown Modal */}
      <Modal
        visible={notebookDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotebookDropdownVisible(false)}
      >
        <Pressable 
          style={styles.dropdownOverlay} 
          onPress={() => setNotebookDropdownVisible(false)}
        >
          <View style={[styles.dropdown, { backgroundColor: colors.surface }]}>
            {notebooks.map(nb => (
              <Pressable
                key={nb.id}
                onPress={() => { 
                  setSelectedNotebook(nb); 
                  setNotebookDropdownVisible(false);
                  handleNotebookChange(noteId, nb.id, nb.title);
                }}
                style={[
                  styles.dropdownItem,
                  selectedNotebook?.id === nb.id && { backgroundColor: colors.primary + '20' }
                ]}
              >
                <Ionicons 
                  name={selectedNotebook?.id === nb.id ? "book" : "book-outline"} 
                  size={18} 
                  color={selectedNotebook?.id === nb.id ? colors.primary : colors.text} 
                  style={{ marginRight: 8 }} 
                />
                <Text style={{ 
                  color: selectedNotebook?.id === nb.id ? colors.primary : colors.text, 
                  fontSize: 15,
                  fontWeight: selectedNotebook?.id === nb.id ? '600' : '400'
                }}>
                  {nb.title}
                </Text>
                {selectedNotebook?.id === nb.id && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} style={{ marginLeft: 'auto' }} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Modern Card Content */}
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}> 
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 36, marginBottom: 4 }}>📝</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Created on {note.date}</Text>
        </View>

        {isEditing ? (
          <>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              placeholder="Title"
              placeholderTextColor={colors.textSecondary}
              value={editedTitle}
              onChangeText={setEditedTitle}
              maxLength={60}
            />
            <RichTextEditor
              value={editedContent}
              onValueChange={setEditedContent}
              placeholder="Write your note here..."
              placeholderTextColor={colors.textSecondary}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 10,
                borderWidth: 1.2,
                borderColor: colors.border,
                padding: 12,
                minHeight: 120,
                textAlignVertical: "top",
                marginBottom: 8,
                color: colors.text,
              }}
              pellEditorRef={pellEditorRef}
            />
            <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'right', marginBottom: 16 }}>
              {editedContent.length}/1000 characters
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: colors.text }]}>{note.title}</Text>
            <RichTextEditor
              value={note.content}
              onValueChange={() => {}} // No content change handler for display
              placeholder="Write your note here..."
              placeholderTextColor={colors.textSecondary}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 10,
                borderWidth: 1.2,
                borderColor: colors.border,
                padding: 12,
                minHeight: 120,
                textAlignVertical: "top",
                marginBottom: 8,
                color: colors.text,
              }}
              pellEditorRef={pellEditorRef}
            />
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.success }]}
                onPress={handleSave}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.actionButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.warning }]}
                onPress={() => {
                  setEditedTitle(note.title);
                  setEditedContent(note.content);
                  setIsEditing(false);
                }}
              >
                <Ionicons name="close" size={20} color="white" />
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.accent }]}
                onPress={handleShare}
              >
                <Ionicons name="share-social-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Floating Action Button for Edit */}
      <View style={styles.fabContainer} pointerEvents={deleting ? 'none' : 'auto'}>
        <FAB 
          onPress={handleEditNote} 
          icon={deleting ? 'hourglass-outline' : 'pencil-outline'}
          backgroundColor={deleting ? colors.warning : colors.primary}
        />
      </View>

      {/* Note Editor Modal */}
      <NoteEditor
        visible={editorVisible}
        onClose={handleCloseEditor}
        onSave={handleSaveNote}
        onNotebookChange={handleNotebookChange}
        saving={saving}
        editingNote={note ? {
          id: note.id,
          title: note.title,
          content: note.content,
          notebookId: note.notebookId,
          notebookTitle: selectedNotebook?.title || 'My Notebook',
          date: note.date,
        } : null}
      />
    </DarkGradientBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 2,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    borderRadius: 24,
    padding: 8,
  },
  menuButton: {
    borderRadius: 24,
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    marginTop: 32,
    marginHorizontal: 18,
    borderRadius: 18,
    padding: 22,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    fontWeight: "500",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.2,
  },
  textarea: {
    fontSize: 15,
    borderRadius: 10,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 8,
    borderWidth: 1.2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    right: 28,
    bottom: 36,
    zIndex: 10,
  },
  notebookSelectorContainer: {
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent', // Initially transparent, will be filled by borderBottomColor
  },
  notebookSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent', // Initially transparent, will be filled by borderBottomColor
  },
  dropdownOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdown: {
    width: '80%',
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Default border color
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: '60%',
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default NoteDetailScreen; 