import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: any;
}

// Microsoft Teams-inspired dark gradient (updated)
const DARK_GRADIENT: [string, string, string] = ['#070c18', '#0a1420', '#0f1a28'];
const ARC_COLOR = '#0a1420';

export default function DarkGradientBackground({ children, style }: Props) {
  const { colors } = useTheme();
  const isDark = colors.background === '#151718' || colors.background === '#101a2b';

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