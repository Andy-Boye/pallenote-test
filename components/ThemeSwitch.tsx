"use client"

import React from "react"
import { View, Text, Switch } from "react-native"
import { useTheme } from "@/contexts/ThemeContext"

const ThemeSwitch = () => {
  const { isDarkMode, toggleTheme, colors } = useTheme()

  return (
    <View
      className="flex-row items-center justify-between px-4 py-3 mx-4 mt-2 rounded-2xl shadow"
      style={{ backgroundColor: colors.surface }}
    >
      <Text
        className="text-base font-medium"
        style={{ color: colors.text }}
      >
        {isDarkMode ? "Dark Mode" : "Light Mode"}
      </Text>

      <Switch
        value={isDarkMode}
        onValueChange={toggleTheme}
        thumbColor={isDarkMode ? colors.primary : "#f4f3f4"}
        trackColor={{ false: "#ccc", true: colors.primary }}
      />
    </View>
  )
}

export default ThemeSwitch
