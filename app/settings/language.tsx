"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState, useEffect } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import DarkGradientBackground from '../../components/DarkGradientBackground'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LanguageScreen = () => {
  const { colors } = useTheme()
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const router = useRouter()

  const languages = [
    { name: "English", code: "en", flag: "🇺🇸", nativeName: "English" },
    { name: "Spanish", code: "es", flag: "🇪🇸", nativeName: "Español" },
    { name: "French", code: "fr", flag: "🇫🇷", nativeName: "Français" },
    { name: "German", code: "de", flag: "🇩🇪", nativeName: "Deutsch" },
    { name: "Italian", code: "it", flag: "🇮🇹", nativeName: "Italiano" },
    { name: "Portuguese", code: "pt", flag: "🇵🇹", nativeName: "Português" },
    { name: "Russian", code: "ru", flag: "🇷🇺", nativeName: "Русский" },
    { name: "Chinese", code: "zh", flag: "🇨🇳", nativeName: "中文" },
    { name: "Japanese", code: "ja", flag: "🇯🇵", nativeName: "日本語" },
    { name: "Korean", code: "ko", flag: "🇰🇷", nativeName: "한국어" },
    { name: "Hindi", code: "hi", flag: "🇮🇳", nativeName: "हिन्दी" },
    { name: "Arabic", code: "ar", flag: "🇸🇦", nativeName: "العربية" },
    { name: "Turkish", code: "tr", flag: "🇹🇷", nativeName: "Türkçe" },
    { name: "Twi", code: "tw", flag: "🇬🇭", nativeName: "Twi" },
    { name: "Dutch", code: "nl", flag: "🇳🇱", nativeName: "Nederlands" },
    { name: "Swedish", code: "sv", flag: "🇸🇪", nativeName: "Svenska" },
    { name: "Danish", code: "da", flag: "🇩🇰", nativeName: "Dansk" },
    { name: "Norwegian", code: "no", flag: "🇳🇴", nativeName: "Norsk" },
  ]

  // Load saved language preference on component mount
  useEffect(() => {
    loadLanguagePreference()
  }, [])

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage')
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage)
      }
    } catch (error) {
      console.error('Error loading language preference:', error)
    }
  }

  const handleLanguageSelect = async (language: string) => {
    try {
      // Save language preference
      await AsyncStorage.setItem('selectedLanguage', language)
      setSelectedLanguage(language)
      
      // Show success message
      Alert.alert(
        "Language Changed",
        `App language has been changed to ${language}. Some changes may require a restart to take full effect.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Here you would typically trigger a language change in your app
              // For now, we'll just show the success message
            }
          }
        ]
      )
    } catch (error) {
      console.error('Error saving language preference:', error)
      Alert.alert("Error", "Failed to save language preference. Please try again.")
    }
  }

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Language</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Choose your preferred language
        </Text>
        {languages.map((language, index) => {
          const isSelected = selectedLanguage === language.name;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleLanguageSelect(language.name)}
              style={[
                styles.languageOption,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? colors.primary : "transparent",
                },
              ]}
            >
              <Text style={styles.flag}>{language.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.languageName, { color: colors.text }]}>{language.name}</Text>
                <Text style={[styles.languageCode, { color: colors.textSecondary }]}>
                  {language.nativeName} • {language.code.toUpperCase()}
                </Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </DarkGradientBackground>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 18,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  flag: { fontSize: 24, marginRight: 12 },
  languageName: {
    fontSize: 16,
    fontWeight: "600",
  },
  languageCode: {
    fontSize: 13,
    marginTop: 2,
  },
})

export default LanguageScreen
