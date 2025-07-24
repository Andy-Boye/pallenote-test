// app/tasks/new.tsx
"use client";

import { createTask } from "@/api/tasksApi";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import DarkGradientBackground from '../../components/DarkGradientBackground';
import FAB from '../../components/FAB';

export default function NewTaskScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Task title is required.");
      return;
    }
    setSaving(true);
    try {
      await createTask({ title, description, completed: false });
      router.replace("/tasks");
    } catch (error) {
      console.error("Failed to create task", error);
      Alert.alert("Error", "Failed to create task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.headerTitle, { color: colors.text }]}>📝 New Task</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.addButton, { backgroundColor: colors.primary }]}> 
          <Text style={{ color: '#fff', fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
      </View>
      {/* Modern Card Form */}
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}> 
        <TextInput
          placeholder="Title"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
          maxLength={60}
        />
        <TextInput
          placeholder="Description"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={[styles.textarea, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
          maxLength={300}
        />
      </View>
      {/* Floating Save Button */}
      <View style={styles.fabContainer} pointerEvents={saving ? 'none' : 'auto'}>
        <FAB onPress={handleSave} icon={saving ? 'cloud-upload' : 'checkmark-outline'} />
      </View>
    </DarkGradientBackground>
  );
}

const styles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButton: {
    borderRadius: 24,
    padding: 8,
    marginLeft: 8,
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
    fontWeight: '500',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.2,
  },
  textarea: {
    fontSize: 15,
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
    borderWidth: 1.2,
  },
  fabContainer: {
    position: 'absolute',
    right: 28,
    bottom: 36,
    zIndex: 10,
  },
};
