import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: any;
}

// Updated gradient colors to match Microsoft Teams dark theme
const DARK_GRADIENT: [string, string, string] = ['#1b1b1b', '#2d2d30', '#3c3c3c'];
const ARC_COLOR = '#1b1b1b';

export default function DarkGradientBackground({ children, style }: Props) {
  const { colors } = useTheme();
  // Updated to check for Microsoft Teams dark background colors
  const isDark = colors.background === '#1b1b1b' || colors.background === '#2d2d30' || colors.background === '#3c3c3c';

  if (!isDark) {
    return <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>{children}</View>;
  }

  return (
    <View style={[{ flex: 1 }, style]}>
      <LinearGradient
        colors={DARK_GRADIENT}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: ARC_COLOR, borderBottomLeftRadius: 60, borderBottomRightRadius: 60, opacity: 0.12, zIndex: 1 }} />
      {children}
    </View>
  );
} 