import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface ScreenBackgroundProps {
  children: React.ReactNode;
  showDecorations?: boolean;
}

const ScreenBackground: React.FC<ScreenBackgroundProps> = ({ 
  children, 
  showDecorations = true 
}) => {
  const { colors, isDarkMode } = useTheme();

  if (!isDarkMode) {
    // Light mode - use solid background
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {children}
      </View>
    );
  }

  // Dark mode - use gradient background
  return (
    <View style={styles.container}>
      {/* Enhanced gradient background */}
      <LinearGradient
        colors={['#070c18', '#101a2b', '#181f2e']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      {/* Enhanced decorative elements */}
      {showDecorations && (
        <>
          <View style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: 120, 
            backgroundColor: '#101a2b', 
            borderBottomLeftRadius: 80, 
            borderBottomRightRadius: 80, 
            opacity: 0.15, 
            zIndex: 1 
          }} />
          <View style={{ 
            position: 'absolute', 
            top: 40, 
            left: 20, 
            right: 20, 
            height: 60, 
            backgroundColor: '#0078d4', 
            borderRadius: 30, 
            opacity: 0.08, 
            zIndex: 1 
          }} />
        </>
      )}
      
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenBackground; 