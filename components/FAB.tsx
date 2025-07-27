"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { Pressable } from "react-native"

interface FABProps {
  onPress?: () => void
  icon?: string
  size?: number
  color?: string
  backgroundColor?: string
}

const FAB = ({ onPress, icon = "add", size = 26, color, backgroundColor }: FABProps) => {
  const { colors } = useTheme()

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      console.log("FAB pressed - no action defined")
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{ color: "rgba(255,255,255,0.2)" }}
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: backgroundColor || color || colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Ionicons name={icon as any} size={size} color="#FFFFFF" />
    </Pressable>
  )
}

export default FAB
