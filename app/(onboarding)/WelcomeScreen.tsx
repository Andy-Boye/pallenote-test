"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useRouter } from "expo-router"
import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import DarkGradientBackground from '../../components/DarkGradientBackground'

const WelcomeScreen = () => {
  const router = useRouter()
  const { colors } = useTheme()
  const { user } = useAuth()

  const handleGetStarted = () => {
    console.log("Get Started pressed")
    if (user) {
      router.replace("/(tabs)/home")
    } else {
      router.replace("/(auth)/login")
    }
  }

  return (
    <DarkGradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top','bottom','left','right']}>
        <View style={styles.container}> 
          <Text style={[styles.emoji, { color: colors.primary }]}>📚</Text>

          <Text style={[styles.title, { color: colors.primary }]}> 
            Welcome to Pallenote
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}> 
            Your smart AI-powered study partner.{"\n"}
            Let&apos;s take your learning to the next level!
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: colors.primary,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 6,
              },
            ]}
            onPress={handleGetStarted}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>

          <Text style={[styles.footerText, { color: colors.textSecondary }]}> 
            🚀 Powered by AI • Designed for Students
          </Text>
        </View>
      </SafeAreaView>
    </DarkGradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
    alignItems: "center",
  },
  emoji: {
    fontSize: 72,
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    fontFamily: "InterBold",
    textAlign: "center",
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter",
    textAlign: "center",
    marginBottom: 50,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontFamily: "InterMedium",
    textAlign: "center",
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter",
    marginTop: 50,
    textAlign: "center",
  },
})

export default WelcomeScreen
