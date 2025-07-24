"use client"

import QuickStat from "@/components/QuickStat";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DarkGradientBackground from '../../components/DarkGradientBackground';
import NotebookCard from "../../components/NoteCard";

const getNotebooks = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "1", title: "Work Notes", description: "Meeting notes and project updates" },
        { id: "2", title: "Personal", description: "Personal thoughts and ideas" },
        { id: "3", title: "Study", description: "Learning materials and notes" },
      ])
    }, 1000)
  })
}

const NotebooksScreen = () => {
  const router = useRouter()
  const { colors } = useTheme()
  const [notebooks, setNotebooks] = useState<{ id: string; title: string; description: string }[]>([])
  const [loading, setLoading] = useState(true)
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
        const data = await getNotebooks()
        setNotebooks(data as any)
      } catch (err) {
        console.error("Error loading notebooks:", err)
        Alert.alert("Error", "Failed to load notebooks")
      } finally {
        setLoading(false)
      }
    }
    fetchNotebooks()
  }, [])

  const openNotebook = (notebook: any) => {
    router.push(`../notebooks/${notebook.id}`)
  }

  const addNotebook = () => {
    Alert.alert("Add Notebook", "Creating new notebook...")
  }

  const totalNotebooks = notebooks.length;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <DarkGradientBackground>
      {/* Modern Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary, marginRight: 10 }}>📒</Text>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Notebooks</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Organize your notes by topic</Text>
        </View>
        <TouchableOpacity onPress={addNotebook} style={[styles.addButton, { backgroundColor: colors.primary }]}> 
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <QuickStat label="Total" value={totalNotebooks} icon="book-open" />
      </View>

      {/* Notebook List */}
      <FlatList
        data={notebooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotebookCard note={item} onPress={() => openNotebook(item)} />}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: insets.bottom + 40 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 10 }}>��</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>No notebooks yet</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', maxWidth: 260 }}>
              Create your first notebook to organize your notes.
            </Text>
            <Text style={{ color: colors.primary, fontSize: 15, marginTop: 18, fontWeight: '500' }}>
              Tip: Tap the + button to add a notebook.
            </Text>
          </View>
        }
      />
    </DarkGradientBackground>
  )
}

const styles = StyleSheet.create({
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
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 2,
  },
  addButton: {
    borderRadius: 24,
    padding: 8,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 2,
    gap: 8,
  },
});

export default NotebooksScreen
