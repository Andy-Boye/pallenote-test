import { getNoteById } from "@/api/notesApi";
import type { Note } from "@/api/types";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import DarkGradientBackground from '../../../components/DarkGradientBackground';
import FAB from "../../../components/FAB";

const NoteDetailScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");

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

  const handleDelete = () => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDeleting(true);
            setTimeout(() => {
              setDeleting(false);
              Alert.alert("Deleted", "Note deleted successfully.");
              router.replace("/(tabs)/notes");
            }, 800);
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
    // TODO: Implement actual save functionality
    Alert.alert("Success", "Note updated successfully!");
    setIsEditing(false);
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality coming soon!');
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
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.primary }]}> 
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

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
            <TextInput
              style={[styles.textarea, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              placeholder="Write your note here..."
              placeholderTextColor={colors.textSecondary}
              value={editedContent}
              onChangeText={setEditedContent}
              multiline
              maxLength={1000}
            />
            <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'right', marginBottom: 16 }}>
              {editedContent.length}/1000 characters
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: colors.text }]}>{note.title}</Text>
            <Text style={[styles.content, { color: colors.textSecondary }]}>{note.content}</Text>
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

      {/* Floating Action Button for Delete */}
      <View style={styles.fabContainer} pointerEvents={deleting ? 'none' : 'auto'}>
        <FAB 
          onPress={handleDelete} 
          icon={deleting ? 'cloud-upload' : 'trash-outline'}
          backgroundColor={colors.error}
        />
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
  backButton: {
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
});

export default NoteDetailScreen; 