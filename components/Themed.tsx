"use client"

import React from "react"
import {
  Text as DefaultText,
  View as DefaultView,
  TextProps as RNTextProps,
  ViewProps as RNViewProps,
} from "react-native"
import { useTheme } from "@/contexts/ThemeContext"

type ThemeProps = {
  lightColor?: string
  darkColor?: string
}

export type TextProps = ThemeProps & RNTextProps
export type ViewProps = ThemeProps & RNViewProps

function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ReturnType<typeof useTheme>["colors"]
) {
  const { colors } = useTheme()
  // Fallback: always use colors[colorName]
  return colors[colorName]
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text")

  return (
    <DefaultText
      {...otherProps}
      style={[{ color, fontFamily: "System" }, style]} // Add custom tailwind-like styling here
    />
  )
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "background")

  return (
    <DefaultView
      {...otherProps}
      style={[{ backgroundColor }, style]}
    />
  )
}
