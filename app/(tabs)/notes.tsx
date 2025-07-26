"use client";

import { getNotes } from "@/api/notesApi";
import type { Note } from "@/api/types";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, StatusBar, Text, TouchableOpacity, View } from "react-native";
import ScreenBackground from '../../components/ScreenBackground';

const NotesScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

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
    router.push(`/note-detail?id=${noteId}`);
  };

  const addNote = () => {
    router.push("/note-detail?action=new");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'transparent' }]}> 
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary, marginRight: 10 }}>📝</Text>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notes</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Your recent notes and ideas</Text>
        </View>
        <TouchableOpacity 
          onPress={addNote} 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openNote(item.id)}
            style={[
              styles.noteCard,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.noteTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.noteDate, { color: colors.textSecondary }]}>{item.date}</Text>
            </View>
            <Text style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.content}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 20 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: colors.textSecondary }}>
            No notes available.
          </Text>
        }
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "transparent",
    zIndex: 10,
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
    zIndex: 11,
    elevation: 3,
  },
  noteCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  noteContent: {
    fontSize: 14,
    marginTop: 4,
  },
  noteDate: {
    fontSize: 12,
    marginLeft: 8,
  },
});

export default NotesScreen;
