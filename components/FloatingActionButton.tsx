"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Animated, Pressable, View } from "react-native"

const FloatingActionButton = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [animation] = useState(new Animated.Value(0))

  const toggleMenu = () => {
    Animated.spring(animation, {
      toValue: isOpen ? 0 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start()
    setIsOpen(!isOpen)
  }

  const handleAction = (action: string) => {
    setIsOpen(false)
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
    }).start()

    switch (action) {
      case "note":
        router.push("/notes/new")
        break
      case "task":
        router.push("/tasks/new")
        break
      case "recording":
        router.push("/recording")
        break
    }
  }

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  })

  const getTranslateY = (distance: number) =>
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -distance],
    })

  return (
    <View style={{ position: 'absolute', bottom: 0, right: 0, alignItems: 'flex-end', width: 200, zIndex: 200 }}>
      {/* Options Panel */}
      {isOpen && (
        <Animated.View
          style={{
            marginBottom: 14,
            width: 128,
            borderRadius: 16,
            backgroundColor: colors.surface,
            padding: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
            opacity: animation,
            transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Pressable
              onPress={() => handleAction('note')}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}
            >
              <Ionicons name="document-text" size={22} color="#fff" />
            </Pressable>
            <Pressable
              onPress={() => handleAction('task')}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.warning, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="checkbox" size={22} color="#fff" />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable
              onPress={() => handleAction('recording')}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}
            >
              <Ionicons name="mic" size={22} color="#fff" />
            </Pressable>
            <Pressable
              onPress={() => alert('Add Shortcut pressed!')}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="add-circle" size={22} color="#fff" />
            </Pressable>
          </View>
        </Animated.View>
      )}
      {/* Main FAB */}
      <Pressable
        onPress={toggleMenu}
        android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </Animated.View>
      </Pressable>
    </View>
  )
}

export default FloatingActionButton
