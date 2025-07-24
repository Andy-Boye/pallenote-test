import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { Note } from "../../../api/types";
import { useTheme } from "@/contexts/ThemeContext";
import FAB from "@/components/FAB";
import NoteCard from "@/components/NoteCard";

export default function NotebookDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { notebookId, notebookName } = useLocalSearchParams<{
    notebookId: string;
    notebookName: string;
  }>();

  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        // TODO: Replace with correct data fetching logic for notes by notebookId
        setNotes([]);
      } catch (error) {
        console.error("Failed to load notes", error);
      }
    };

    if (notebookId) {
      fetchNotes();
    }
  }, [notebookId]);

  const handleNotePress = (note: Note) => {
    router.push({
      pathname: `/notes/${note.id}/edit` as any,
      params: { notebookId },
    });
  };

  return (
    <View className="flex-1 p-4" style={{ backgroundColor: colors.background }}>
      <Text className="text-xl font-bold mb-4" style={{ color: colors.text }}>
        {notebookName || "Notebook"}
      </Text>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NoteCard note={item} onPress={() => handleNotePress(item)} />
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.text }}>No notes in this notebook.</Text>
        }
      />

      <FAB
        onPress={() =>
          router.push({
            pathname: "/notes/new" as any,
            params: { notebookId },
          })
        }
      />
    </View>
  );
}
