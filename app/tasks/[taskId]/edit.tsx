// app/tasks/[taskId]/edit.tsx
"use client"

import React, { useEffect, useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useTheme } from "@/contexts/ThemeContext"
import { getTaskById, updateTask } from "@/api/tasksApi"

export default function EditTaskScreen() {
  const { taskId } = useLocalSearchParams()
  const { colors } = useTheme()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const task = await getTaskById(taskId as string)
        setTitle(task.title)
        setDescription(task.description || "")
      } catch (error) {
        console.error("Failed to load task", error)
        Alert.alert("Error", "Failed to load task.")
      }
    }

    if (taskId) fetchTask()
  }, [taskId])

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Title cannot be empty.")
      return
    }

    try {
      await updateTask(taskId as string, { title, description })
      router.replace("/tasks")
    } catch (error) {
      console.error("Failed to update task", error)
      Alert.alert("Error", "Failed to update task.")
    }
  }

  return (
    <View className="flex-1 px-4 py-6" style={{ backgroundColor: colors.background }}>
      <Text className="text-xl font-bold mb-6" style={{ color: colors.text }}>
        Edit Task
      </Text>

      <TextInput
        placeholder="Title"
        placeholderTextColor={colors.textDim}
        value={title}
        onChangeText={setTitle}
        className="w-full mb-4 px-4 py-3 rounded-2xl text-base"
        style={{ backgroundColor: colors.card, color: colors.text }}
      />

      <TextInput
        placeholder="Description"
        placeholderTextColor={colors.textDim}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        className="w-full mb-6 px-4 py-3 rounded-2xl text-base"
        style={{ backgroundColor: colors.card, color: colors.text }}
      />

      <TouchableOpacity
        onPress={handleUpdate}
        className="w-full py-3 rounded-2xl items-center"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-base font-semibold" style={{ color: "#ffffff" }}>
          Update Task
        </Text>
      </TouchableOpacity>
    </View>
  )
}
