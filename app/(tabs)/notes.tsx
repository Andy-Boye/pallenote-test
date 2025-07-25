"use client";

import { getNotes } from "@/api/notesApi";
import type { Note } from "@/api/types";
import FAB from "@/components/FAB";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const NotesScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

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

  const addNote = () => {
    router.push("../notes/new");
  };

  // Filter notes by search text
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchText.toLowerCase()) ||
    note.content.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}> 
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text, textAlign: 'left' }]}>Notes</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary, textAlign: 'left' }]}>Your recent notes and ideas</Text>
        </View>
      </View>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.accent }]}> 
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search notes..."
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
        />
      </View>
      {/* Total Notes Row */}
      <View style={styles.statsSimpleRow}>
        <Ionicons name="document-text-outline" size={20} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={{ color: colors.text, fontWeight: '600' }}>Total Notes: {filteredNotes.length}</Text>
      </View>
      <FlatList
        data={filteredNotes}
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
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: colors.textSecondary }}>
            No notes available.
          </Text>
        }
      />
      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <FAB onPress={addNote} icon="add" size={28} color={colors.success} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'left',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 10,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
  fabContainer: {
    position: 'absolute',
    right: 28,
    bottom: 36,
    zIndex: 10,
  },
  // Add statsSimpleRow for the total notes row
  statsSimpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 0,
  },
});

export default NotesScreen;
