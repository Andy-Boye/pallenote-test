import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface CustomLogoProps {
  size?: number;
  showGlow?: boolean;
}

const CustomLogo: React.FC<CustomLogoProps> = ({ 
  size = width * 0.25, 
  showGlow = true 
}) => {
  const baseFontSize = size * 0.4;
  
  return (
    <View style={styles.container}>
      {/* Glow effect behind the logo */}
      {showGlow && (
        <View style={[styles.glowBackground, { width: size * 1.2, height: size * 1.2 }]} />
      )}
      
      {/* Main logo text */}
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { fontSize: baseFontSize }]}>
          <Text style={styles.pallText}>Pall</Text>
          <Text style={styles.eText}>e</Text>
          <Text style={styles.noteText}>note</Text>
        </Text>
      </View>
      
      {/* Teal outline effect */}
      <View style={[styles.outlineContainer, { width: size, height: size }]}>
        <Text style={[styles.outlineText, { fontSize: baseFontSize }]}>
          <Text style={styles.outlinePall}>Pall</Text>
          <Text style={styles.outlineE}>e</Text>
          <Text style={styles.outlineNote}>note</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBackground: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: '#8B5CF6',
    opacity: 0.15,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    position: 'relative',
    zIndex: 2,
  },
  outlineContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logoText: {
    fontFamily: 'System',
    fontWeight: '700',
    textAlign: 'center',
    color: '#1a1a1a',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  outlineText: {
    fontFamily: 'System',
    fontWeight: '700',
    textAlign: 'center',
    color: 'transparent',
    textShadowColor: '#20B2AA',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  pallText: {
    color: '#1a1a1a',
  },
  eText: {
    color: '#8B5CF6',
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontWeight: '900',
  },
  noteText: {
    color: '#1a1a1a',
  },
  outlinePall: {
    textShadowColor: '#20B2AA',
  },
  outlineE: {
    textShadowColor: '#8B5CF6',
    textShadowRadius: 6,
  },
  outlineNote: {
    textShadowColor: '#20B2AA',
  },
});

export default CustomLogo; 