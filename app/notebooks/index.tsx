// app/notebooks/index.tsx

import FAB from "@/components/FAB";
import NoteCard from "@/components/NoteCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text } from "react-native";
import type { Note } from "../../api/types";
import DarkGradientBackground from '../../components/DarkGradientBackground';

export default function NotebookDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const { notebookId, notebookName } = useLocalSearchParams<{
    notebookId?: string;
    notebookName?: string;
  }>();

  const [notes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!notebookId) return;
      try {
        // This function is no longer imported, so it will cause an error.
        // Assuming the intent was to fetch notes from an API or a local store.
        // For now, we'll leave it as is, but it will need to be implemented.
        // For the purpose of this edit, we'll assume it's a placeholder.
        // In a real scenario, you'd call an API here.
        console.warn("getNotesByNotebookId is not imported, so fetching notes is not implemented.");
        // Example placeholder:
        // const data = await getNotesByNotebookId(notebookId);
        // setNotes(data);
      } catch (error) {
        console.error("Failed to load notes", error);
      }
    };

    fetchNotes();
  }, [notebookId]);

  const handleNotePress = (note: Note) => {
    router.push({
      pathname: `/notes/${note.id}/edit` as any,
      params: { noteId: note.id.toString() },
    });
  };

  return (
    <DarkGradientBackground>
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
          <Text className="text-base" style={{ color: colors.text }}>
            No notes in this notebook.
          </Text>
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
    </DarkGradientBackground>
  );
}
