import { getNotes } from "@/api/notesApi"
import { useTheme } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native"
import type { Note } from "../../api/types"
import DarkGradientBackground from '../../components/DarkGradientBackground'

const NotesScreen = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes()
        setNotes(data)
      } catch (error) {
        console.error("Failed to load notes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <DarkGradientBackground>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {notes.map((note) => (
          <TouchableOpacity
            key={note.id}
            onPress={() => router.push(`../notes/${note.id}`)}
            className="mb-4 p-4 rounded-2xl"
            style={{ backgroundColor: colors.card }}
          >
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              {note.title}
            </Text>
            <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              {note.date}
            </Text>
          </TouchableOpacity>
        ))}

        {notes.length === 0 && (
          <Text className="text-center mt-12 text-base" style={{ color: colors.textSecondary }}>
            No notes found. Tap + to create your first note.
          </Text>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.push("../notes/new")}
        className="absolute bottom-6 right-6 p-4 rounded-full shadow-lg"
        style={{ backgroundColor: colors.primary }}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </DarkGradientBackground>
  )
}

export default NotesScreen
