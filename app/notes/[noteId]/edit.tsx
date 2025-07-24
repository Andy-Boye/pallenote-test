import { getNoteById, updateNote } from "@/api/notesApi";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const EditNoteScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const note = await getNoteById(id);
        setTitle(note.title);
        setContent(note.content);
      } catch {
        Alert.alert("Error", "Failed to load note.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, router]);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Validation", "Title and content cannot be empty.");
      return;
    }

    try {
      await updateNote(id, { title, content });
      router.replace("/notes");
    } catch {
      Alert.alert("Error", "Failed to update note.");
    }
  };

  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4" style={{ backgroundColor: colors.background }}>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor={colors.textSecondary}
        className="text-lg font-bold mb-3 border-b pb-1"
        style={{ color: colors.text, borderBottomColor: colors.border }}
      />

      <TextInput
        placeholder="Edit your note here..."
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
        placeholderTextColor={colors.textSecondary}
        className="flex-1 text-base p-3 rounded-lg border"
        style={{ color: colors.text, borderColor: colors.border }}
      />

      <TouchableOpacity
        onPress={handleUpdate}
        className="absolute bottom-6 right-6 p-4 rounded-full"
        style={{ backgroundColor: colors.primary }}
      >
        <Ionicons name="checkmark-done" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default EditNoteScreen;
