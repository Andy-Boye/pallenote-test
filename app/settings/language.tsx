"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import DarkGradientBackground from '../../components/DarkGradientBackground'

const LanguageScreen = () => {
  const { colors } = useTheme()
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const router = useRouter()

  const languages = [
    { name: "English", code: "en", flag: "🇺🇸" },
    { name: "Spanish", code: "es", flag: "🇪🇸" },
    { name: "French", code: "fr", flag: "🇫🇷" },
    { name: "German", code: "de", flag: "🇩🇪" },
    { name: "Italian", code: "it", flag: "🇮🇹" },
    { name: "Portuguese", code: "pt", flag: "🇵🇹" },
    { name: "Russian", code: "ru", flag: "🇷🇺" },
    { name: "Chinese", code: "zh", flag: "🇨🇳" },
    { name: "Japanese", code: "ja", flag: "🇯🇵" },
    { name: "Korean", code: "ko", flag: "🇰🇷" },
    { name: "Hindi", code: "hi", flag: "🇮🇳" },
    { name: "Arabic", code: "ar", flag: "🇸🇦" },
    { name: "Turkish", code: "tr", flag: "🇹🇷" },
    { name: "Twi", code: "tw", flag: "🇬🇭" },
    { name: "Dutch", code: "nl", flag: "🇳🇱" },
    { name: "Swedish", code: "sv", flag: "🇸🇪" },
    { name: "Danish", code: "da", flag: "🇩🇰" },
    { name: "Norwegian", code: "no", flag: "🇳🇴" },
  ]

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language)
    // TODO: Save preference or apply i18n logic
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
        <Text style={styles.subtitle(colors)}>
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
                <Text style={[styles.languageCode, { color: colors.textSecondary }]}>{language.code}</Text>
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
    gap: 16,
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
  subtitle: (colors: any) => ({
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 18,
  }),
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
