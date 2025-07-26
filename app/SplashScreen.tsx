"use client"

import React, { useEffect, useRef } from "react"
import {
  View,
  Animated,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"

const { width } = Dimensions.get("window")

const SplashScreen = () => {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { colors } = useTheme()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const spinAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const sparkles = useRef(
    Array.from({ length: 8 }).map((_, i) => {
      const angle = (360 / 8) * i
      const radius = width * 0.2
      const x = radius * Math.cos((angle * Math.PI) / 180)
      const y = radius * Math.sin((angle * Math.PI) / 180)
      return {
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(0),
        translateX: new Animated.Value(x),
        baseY: y,
      }
    })
  ).current

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    // One-time spin
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start()

    // Logo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Sparkle animations
    sparkles.forEach((sparkle, index) => {
      const delay = index * 300
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(sparkle.opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle.translateY, {
              toValue: -10,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(sparkle.opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle.translateY, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start()
    })

    if (!loading) {
      const timeout = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          // Always go to onboarding first, then welcome, then home
          router.replace('/(onboarding)/OnboardingScreen')
        })
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [fadeAnim, sparkles, user, loading, router])

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <View style={styles.container}>
      {/* Enhanced gradient background matching recording screen */}
      <LinearGradient
        colors={['#070c18', '#101a2b', '#181f2e']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      {/* Enhanced decorative elements */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, backgroundColor: '#101a2b', borderBottomLeftRadius: 80, borderBottomRightRadius: 80, opacity: 0.15, zIndex: 1 }} />
      <View style={{ position: 'absolute', top: 40, left: 20, right: 20, height: 60, backgroundColor: '#0078d4', borderRadius: 30, opacity: 0.08, zIndex: 1 }} />
      
      <StatusBar barStyle="light-content" backgroundColor="#070c18" />

      <Animated.View style={[styles.logoWrapper, { opacity: fadeAnim }]}>
        {/* Sparkles */}
        {sparkles.map((sparkle, i) => (
          <Animated.View
            key={i}
            style={[
              styles.sparkle,
              {
                transform: [
                  { translateX: sparkle.translateX },
                  { translateY: Animated.add(new Animated.Value(sparkle.baseY), sparkle.translateY) },
                ],
                opacity: sparkle.opacity,
              },
            ]}
          />
        ))}

        {/* Rotating "P" Circle */}
        <Animated.View style={[styles.logoCircle, { transform: [{ rotate: spin }] }]}>
          <Text style={styles.logoText}>P</Text>
        </Animated.View>

        {/* Brand Text with Pulse */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Text style={styles.brandText}>
            Pall
            <Text style={styles.brandTextE}>e</Text>
            note
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logoCircle: {
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: (width * 0.22) / 2,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    marginBottom: 5,
  },
  logoText: {
    fontSize: width * 0.12,
    fontWeight: "bold",
    color: "#8B5CF6",
    textAlign: "center",
    textAlignVertical: "center",
  },
  brandText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  brandTextE: {
    fontSize: 56,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#A855F7",
    paddingHorizontal: 4,
  },
  sparkle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff80",
  },
})

export default SplashScreen
