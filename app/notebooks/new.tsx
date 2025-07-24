import { createNotebook } from "@/api/notebooksApi";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import DarkGradientBackground from '../../components/DarkGradientBackground';

export default function AddNotebookScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Notebook title is required");
      return;
    }

    try {
      await createNotebook({ title });
      Alert.alert("Success", "Notebook created");
      router.back();
    } catch (error) {
      console.error("Create notebook failed", error);
      Alert.alert("Error", "Could not create notebook");
    }
  };

  return (
    <DarkGradientBackground>
      <View className="flex-1 p-4">
        <Text className="text-base mb-2" style={{ color: colors.text }}>
          Notebook Title
        </Text>
        <TextInput
          className="border rounded-lg px-3 py-3 mb-4 text-base"
          style={{
            borderColor: colors.border || "#ccc",
            color: colors.text,
          }}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter notebook title"
          placeholderTextColor={colors.textSecondary || "#999"}
        />
        <Button title="Create" onPress={handleCreate} color={colors.primary} />
      </View>
    </DarkGradientBackground>
  );
}
