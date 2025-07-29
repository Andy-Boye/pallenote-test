import type { Notebook } from "@/api/backendTypes";
import { getNotebooks } from "@/api/notebooksApi";
import { createNote, updateNote } from "@/api/notesApi";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Collapsible } from "../../components/Collapsible";
import DarkGradientBackground from '../../components/DarkGradientBackground';
import FAB from "../../components/FAB";
import { ThemedText } from "../../components/ThemedText";

const NewNoteScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { editNote, title: initialTitle, content: initialContent } = useLocalSearchParams<{ 
    editNote?: string; 
    title?: string; 
    content?: string; 
  }>();
  const [title, setTitle] = useState(initialTitle || "");
  const [content, setContent] = useState(initialContent || "");
  const [saving, setSaving] = useState(false);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [notebookDropdownVisible, setNotebookDropdownVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!editNote);

  const loadNotebooks = async () => {
    try {
      const data = await getNotebooks();
      const defaultNotebook = { id: 'default', title: 'My Notebook' } as Notebook;
      const allNotebooks = [defaultNotebook, ...data];
      setNotebooks(allNotebooks);
      setSelectedNotebook(defaultNotebook);
    } catch (error) {
      console.error('Error loading notebooks:', error);
      // Fallback to default notebook
      const defaultNotebook = { id: 'default', title: 'My Notebook' } as Notebook;
      setNotebooks([defaultNotebook]);
      setSelectedNotebook(defaultNotebook);
    }
  };

  // Load notebooks when component mounts
  useEffect(() => {
    loadNotebooks();
  }, []);

  // Refresh notebooks when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadNotebooks();
    }, [])
  );

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Validation", "Please enter both a title and content for your note.");
      return;
    }
    setSaving(true);
    try {
      if (isEditMode && editNote) {
        // Update existing note
        await updateNote(editNote, {
          title: title.trim(),
          content: content.trim(),
        });
        Alert.alert("Success", "Note updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        // Create new note
        await createNote({
          title: title.trim(),
          content: content.trim(),
          date: new Date().toLocaleDateString(),
          notebookId: selectedNotebook?.id || 'default'
        });
        Alert.alert("Success", "Note created successfully!", [
          { text: "OK", onPress: () => router.replace("/(tabs)/notes") },
        ]);
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      Alert.alert("Error", "Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DarkGradientBackground>
      {/* Header (match notes screen) */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEditMode ? 'Edit Note' : 'New Note'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {isEditMode ? 'Update your thoughts' : 'Create and save your thoughts'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={[styles.addButton, { backgroundColor: colors.primary }]}> 
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Modern Card Form */}
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}> 
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 36, marginBottom: 2 }}>📝</Text>
        </View>
        <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 10, textAlign: 'center' }}>
          {isEditMode ? 'Edit Note' : 'Create a Note'}
        </ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
          placeholder="Title"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          maxLength={60}
        />
        
        {/* Notebook Selector */}
        <View style={styles.notebookSelectorContainer}>
          <Pressable
            onPress={() => setNotebookDropdownVisible(true)}
            style={[styles.notebookSelector, { borderBottomColor: colors.border }]}
          >
            <Ionicons name="book-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.textSecondary, fontSize: 15, marginRight: 6 }}>
              {selectedNotebook ? selectedNotebook.title : 'My Notebook'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
          </Pressable>
          <TouchableOpacity
            onPress={loadNotebooks}
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
          </TouchableOpacity>
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
              {/* Refresh option at the top */}
              <Pressable
                onPress={() => {
                  loadNotebooks();
                  setNotebookDropdownVisible(false);
                }}
                style={[styles.dropdownItem, styles.refreshItem]}
              >
                <Ionicons name="refresh" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>Refresh Notebooks</Text>
              </Pressable>
              
              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              {/* Notebook options */}
              {notebooks.map(nb => (
                <Pressable
                  key={nb.id}
                  onPress={() => { 
                    setSelectedNotebook(nb); 
                    setNotebookDropdownVisible(false); 
                  }}
                  style={styles.dropdownItem}
                >
                  <Ionicons name="book-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={{ color: colors.text, fontSize: 15 }}>{nb.title}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>

        <TextInput
          style={[styles.textarea, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
          placeholder="Write your note here..."
          placeholderTextColor={colors.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={1000}
        />
        <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'right', marginBottom: 4 }}>
          {content.length}/1000 characters
        </Text>
        {/* Collapsible Tips Section */}
        <Collapsible title="Tips for Great Notes">
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>• Keep it concise and clear</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>• Use bullet points for lists</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>• Highlight important ideas</Text>
        </Collapsible>
      </View>
      {/* Floating Save Button */}
      <View style={styles.fabContainer} pointerEvents={saving ? 'none' : 'auto'}>
        <FAB onPress={handleSave} icon={saving ? 'cloud-upload' : 'save-outline'} />
      </View>
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
  addButton: {
    borderRadius: 24,
    padding: 8,
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
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 8,
    borderWidth: 1.2,
  },
  notebookSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  notebookSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  refreshButton: {
    borderRadius: 24,
    padding: 8,
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  refreshItem: {
    borderBottomWidth: 0, // No bottom border for the refresh item
  },
  divider: {
    height: 0.5,
    marginVertical: 10,
  },
  fabContainer: {
    position: 'absolute',
    right: 28,
    bottom: 36,
    zIndex: 10,
  },
});

export default NewNoteScreen;
