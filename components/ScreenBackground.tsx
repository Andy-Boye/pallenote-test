import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const TEAMS_DARK_GRADIENT: [string, string, string] = ['#070c18', '#0a1420', '#0f1a28'];
const TEAMS_ARC_COLOR = '#0a1420';

const ScreenBackground = () => {
  const { colors } = useTheme();
  return (
    <>
      <LinearGradient
        colors={TEAMS_DARK_GRADIENT}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.arc(TEAMS_ARC_COLOR) as import('react-native').ViewStyle} />
    </>
  );
};

const styles = {
  arc: (primary: string) => ({
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: primary,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    opacity: 0.12,
    zIndex: 1,
  }),
};

export default ScreenBackground; 