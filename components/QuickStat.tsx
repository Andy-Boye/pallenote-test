"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Feather } from "@expo/vector-icons"
import React from "react"
import { Text, View } from "react-native"

type QuickStatProps = {
  label: string
  value: number | string
  icon?: keyof typeof Feather.glyphMap
}

const QuickStat: React.FC<QuickStatProps> = ({ label, value, icon = "bar-chart-2" }) => {
  const { colors } = useTheme()

  return (
    <View
      style={{
        width: 98,
        height: 110,
        borderRadius: 18,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1.2,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          backgroundColor: `${colors.primary}22`,
          borderRadius: 10,
          padding: 8,
          marginBottom: 8,
        }}
      >
        <Feather name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 22, marginBottom: 2, textAlign: 'center' }}>{value}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', opacity: 0.85 }}>{label}</Text>
    </View>
  )
}

export default QuickStat
