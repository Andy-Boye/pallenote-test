"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React from "react"
import { Text, TouchableOpacity, View } from "react-native"

interface HeaderProps {
  title: string
  showBack?: boolean
  rightIcon?: keyof typeof Ionicons.glyphMap
  onRightPress?: () => void
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  rightIcon,
  onRightPress,
}) => {
  const router = useRouter()
  const { colors } = useTheme()

  return (
    <View
      className="h-14 flex-row items-center justify-between px-4 border-b"
      style={{ backgroundColor: colors.background, borderColor: colors.text + "20" }}
    >
      {showBack ? (
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}

      <Text
        className="text-lg font-semibold"
        style={{ color: colors.text }}
      >
        {title}
      </Text>

      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress}>
          <Ionicons name={rightIcon} size={24} color={colors.primary} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
    </View>
  )
}

export default Header
