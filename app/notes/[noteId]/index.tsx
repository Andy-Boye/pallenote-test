import { getNoteById } from "@/api/notesApi";
import type { Note } from "@/api/types";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const NoteDetailScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!noteId) return;
    setLoading(true);
    getNoteById(noteId)
      .then((data) => {
        setNote(data as Note);
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSecondary }}>Note not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Note</Text>
        <TouchableOpacity onPress={() => router.push(`/notes/${note.id}/edit`)}>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{note.title}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{note.content}</Text>
        <Text style={[styles.noteDate, { color: colors.textSecondary, marginTop: 12 }]}>Date: {note.date}</Text>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.error }]}
          onPress={handleDelete}
          disabled={deleting}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.deleteButtonText}>{deleting ? "Deleting..." : "Delete Note"}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 }}>
          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: colors.primary }]}
            onPress={() => Alert.alert('Share', 'Share functionality coming soon!')}
          >
            <Ionicons name="share-social-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }]}
            onPress={() => router.replace('/(tabs)/notes')}
          >
            <Ionicons name="arrow-back" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.backButtonText, { color: colors.primary }]}>Back to Notes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  noteDate: {
    fontSize: 13,
    marginTop: 12,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    marginRight: 8,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default NoteDetailScreen; 