import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const ScreenBackground = () => {
  const { colors } = useTheme();
  return (
    <>
      <LinearGradient
        colors={[colors.background, colors.primary + '22', colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.arc(colors.primary)} />
    </>
  );
};

const styles = {
  arc: (primary: string) => ({
    position: 'absolute',
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