"use client"

import { useRouter } from "expo-router"
import React, { useEffect, useRef } from "react"
import {
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"

const { width } = Dimensions.get("window")
const SPARKLE_COUNT = 8

const SplashScreen = () => {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { colors } = useTheme()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const spinAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const sparkles = useRef(
    Array.from({ length: SPARKLE_COUNT }).map((_, i) => {
      const angle = (360 / SPARKLE_COUNT) * i
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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start()

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

    sparkles.forEach((sparkle, index) => {
      const delay = index * 200
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
    <View style={[styles.container, { backgroundColor: colors.primary }]}> 
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

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

        {/* Rotating Circle with "P" */}
        <Animated.View style={[styles.logoCircle, { backgroundColor: '#fff', transform: [{ rotate: spin }] }]}> 
          <Text style={[styles.logoText, { color: '#A259FF' }]}>P</Text>
        </Animated.View>

        {/* Brand Text */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Text style={[styles.brandText, { color: "#fff" }]}> 
            Pall
            <Text style={[styles.brandTextE, { color: '#A259FF' }]}>e</Text>
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
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: width * 0.175,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    zIndex: 2,
  },
  logoText: {
    fontSize: width * 0.15,
    fontWeight: "bold",
  },
  brandText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  brandTextE: {
    fontSize: 42,
    fontStyle: "italic",
    fontWeight: "bold",
    color: undefined, // will be set inline
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
