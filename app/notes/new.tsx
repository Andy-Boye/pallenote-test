import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Collapsible } from "../../components/Collapsible";
import DarkGradientBackground from '../../components/DarkGradientBackground';
import FAB from "../../components/FAB";
import { ThemedText } from "../../components/ThemedText";

const NewNoteScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Validation", "Please enter both a title and content for your note.");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert("Success", "Note created successfully!", [
        { text: "OK", onPress: () => router.replace("/(tabs)/notes") },
      ]);
    }, 800);
  };

  return (
    <DarkGradientBackground>
      {/* Header (match notes screen) */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>New Note</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Create and save your thoughts</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={[styles.addButton, { backgroundColor: colors.primary }]}> 
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Modern Card Form */}
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}> 
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 36, marginBottom: 2 }}>📝</Text>
        </View>
        <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 10, textAlign: 'center' }}>Create a Note</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
          placeholder="Title"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          maxLength={60}
        />
        <TextInput
          style={[styles.textarea, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
          placeholder="Write your note here..."
          placeholderTextColor={colors.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={1000}
        />
        <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'right', marginBottom: 4 }}>
          {content.length}/1000 characters
        </Text>
        {/* Collapsible Tips Section */}
        <Collapsible title="Tips for Great Notes">
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>• Keep it concise and clear</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>• Use bullet points for lists</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>• Highlight important ideas</Text>
        </Collapsible>
      </View>
      {/* Floating Save Button */}
      <View style={styles.fabContainer} pointerEvents={saving ? 'none' : 'auto'}>
        <FAB onPress={handleSave} icon={saving ? 'cloud-upload' : 'save-outline'} />
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
  addButton: {
    borderRadius: 24,
    padding: 8,
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
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 8,
    borderWidth: 1.2,
  },
  fabContainer: {
    position: 'absolute',
    right: 28,
    bottom: 36,
    zIndex: 10,
  },
});

export default NewNoteScreen;
