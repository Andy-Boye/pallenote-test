"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { 
  Alert, 
  Modal, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  KeyboardAvoidingView,
  Platform,
  Share
} from "react-native";
import ScreenBackground from '../components/ScreenBackground';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  notebookId?: string;
}

const NoteDetailScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { id, action } = useLocalSearchParams();
  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, fetch from API
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'Welcome to PalNote',
      content: 'This is your first note. Start creating and organizing your thoughts! You can edit this note, delete it, or share it with others. The possibilities are endless with PalNote.',
      date: '2024-01-15'
    },
    {
      id: '2',
      title: 'Meeting Notes',
      content: 'Team sync discussion points and action items for the week. Key topics covered: Project timeline updates, resource allocation, and upcoming milestones.',
      date: '2024-01-14'
    },
    {
      id: '3',
      title: 'Shopping List',
      content: 'Groceries and household items needed for the week: Milk, bread, eggs, vegetables, fruits, and cleaning supplies.',
      date: '2024-01-13'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundNote = mockNotes.find(n => n.id === id);
      if (foundNote) {
        setNote(foundNote);
        setEditedTitle(foundNote.title);
        setEditedContent(foundNote.content);
      }
      setLoading(false);
    }, 500);
  }, [id]);

  useEffect(() => {
    if (action === 'new') {
      setIsEditing(true);
      setNote({
        id: Date.now().toString(),
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0]
      });
      setEditedTitle('');
      setEditedContent('');
      setLoading(false);
    }
  }, [action]);

  const handleSave = () => {
    if (!editedTitle.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    // In real app, save to API
    setNote({
      ...note!,
      title: editedTitle,
      content: editedContent,
      date: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
    Alert.alert('Success', 'Note saved successfully!');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // In real app, delete from API
            Alert.alert('Success', 'Note deleted successfully!');
            router.back();
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${note?.title}\n\n${note?.content}\n\nCreated on: ${note?.date}`,
        title: note?.title
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share note');
    }
  };

  const handleDuplicate = () => {
    const newNote = {
      ...note!,
      id: Date.now().toString(),
      title: `${note?.title} (Copy)`,
      date: new Date().toISOString().split('T')[0]
    };
    setNote(newNote);
    setEditedTitle(newNote.title);
    setEditedContent(newNote.content);
    Alert.alert('Success', 'Note duplicated!');
  };

  const handleExport = () => {
    Alert.alert(
      'Export Note',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Text File', onPress: () => Alert.alert('Success', 'Note exported as text file!') },
        { text: 'PDF', onPress: () => Alert.alert('Success', 'Note exported as PDF!') },
        { text: 'Markdown', onPress: () => Alert.alert('Success', 'Note exported as Markdown!') }
      ]
    );
  };

  if (loading) {
    return (
      <ScreenBackground showDecorations={false}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading note...</Text>
        </View>
      </ScreenBackground>
    );
  }

  if (!note) {
    return (
      <ScreenBackground showDecorations={false}>
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Note Not Found</Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            The note you're looking for doesn't exist or has been deleted.
          </Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground showDecorations={false}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {isEditing ? 'Edit Note' : 'Note Details'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.optionsButton}
            onPress={() => setShowOptions(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Note Content */}
          <View style={[styles.noteContainer, { backgroundColor: colors.surface }]}>
            {isEditing ? (
              <>
                <TextInput
                  style={[styles.titleInput, { color: colors.text, borderColor: colors.border }]}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  placeholder="Note title..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
                <TextInput
                  style={[styles.contentInput, { color: colors.text, borderColor: colors.border }]}
                  value={editedContent}
                  onChangeText={setEditedContent}
                  placeholder="Start writing your note..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  textAlignVertical="top"
                />
              </>
            ) : (
              <>
                <Text style={[styles.noteTitle, { color: colors.text }]}>{note.title}</Text>
                <Text style={[styles.noteContent, { color: colors.textSecondary }]}>{note.content}</Text>
              </>
            )}
            
            <View style={styles.noteMeta}>
              <Text style={[styles.noteDate, { color: colors.textDim }]}>
                Created: {note.date}
              </Text>
              {note.notebookId && (
                <View style={[styles.notebookTag, { backgroundColor: colors.primary }]}>
                  <Text style={styles.notebookTagText}>Notebook</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={() => setIsEditing(false)}
              >
                <Ionicons name="close" size={20} color="white" />
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.success }]}
                onPress={handleSave}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.actionButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.viewActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.warning }]}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Options Modal */}
        <Modal
          visible={showOptions}
          transparent
          animationType="slide"
          onRequestClose={() => setShowOptions(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.optionsModal, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Note Options</Text>
                <TouchableOpacity onPress={() => setShowOptions(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.optionsList}>
                <TouchableOpacity 
                  style={[styles.optionItem, { borderBottomColor: colors.border }]}
                  onPress={() => { setShowOptions(false); setIsEditing(true); }}
                >
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                  <Text style={[styles.optionText, { color: colors.text }]}>Edit Note</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.optionItem, { borderBottomColor: colors.border }]}
                  onPress={() => { setShowOptions(false); handleDuplicate(); }}
                >
                  <Ionicons name="copy-outline" size={20} color={colors.warning} />
                  <Text style={[styles.optionText, { color: colors.text }]}>Duplicate</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.optionItem, { borderBottomColor: colors.border }]}
                  onPress={() => { setShowOptions(false); handleShare(); }}
                >
                  <Ionicons name="share-outline" size={20} color={colors.success} />
                  <Text style={[styles.optionText, { color: colors.text }]}>Share</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.optionItem, { borderBottomColor: colors.border }]}
                  onPress={() => { setShowOptions(false); handleExport(); }}
                >
                  <Ionicons name="download-outline" size={20} color={colors.accent} />
                  <Text style={[styles.optionText, { color: colors.text }]}>Export</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.optionItem, { borderBottomColor: colors.border }]}
                  onPress={() => { setShowOptions(false); handleDelete(); }}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                  <Text style={[styles.optionText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
    position: 'relative',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  noteContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 32,
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 60,
  },
  contentInput: {
    fontSize: 16,
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 200,
    lineHeight: 24,
  },
  noteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteDate: {
    fontSize: 14,
  },
  notebookTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  notebookTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
    gap: 12,
  },
  viewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    flex: 1,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsList: {
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    gap: 16,
  },
  optionText: {
    fontSize: 16,
  },
});

export default NoteDetailScreen; 