import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DarkGradientBackground from '../../components/DarkGradientBackground';

const FAQScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const faqData = [
    {
      question: "How do I create a new note?",
      answer: 'You can create a new note by tapping the "+" button on the home screen or using the floating action button.',
    },
    {
      question: "Can I sync my notes across devices?",
      answer: "Yes! With a Pro or Premium subscription, your notes automatically sync across all your devices.",
    },
    {
      question: "How do I record audio notes?",
      answer: "Tap the microphone icon in the floating action button or go to the recording screen from the main menu.",
    },
    {
      question: "Is my data secure?",
      answer: "We use end-to-end encryption to protect your notes and personal information.",
    },
    {
      question: "How do I organize my notes?",
      answer: "You can organize notes using notebooks, tags, and folders. Create notebooks from the main menu.",
    },
    {
      question: "Can I export my notes?",
      answer: "Yes, you can export your notes in various formats including PDF, TXT, and Markdown from the settings.",
    },
    {
      question: "How do I upgrade my plan?",
      answer: "Go to Settings > Payment Plans to view and upgrade to Pro or Premium plans.",
    },
    {
      question: "What happens if I forget my password?",
      answer: 'Use the "Forgot Password" link on the login screen to reset your password via email.',
    },
  ];

  const toggleExpanded = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>FAQ</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Frequently asked questions about Pallenote</Text>
        {faqData.map((item, index) => (
          <View
            key={index}
            style={[styles.faqCard, { backgroundColor: colors.surface }]}
          >
            <TouchableOpacity
              style={styles.faqQuestionRow}
              onPress={() => toggleExpanded(index)}
            >
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                {item.question}
              </Text>
              <Ionicons
                name={expandedItems.includes(index) ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {expandedItems.includes(index) && (
              <View style={styles.faqAnswerContainer}>
                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                  {item.answer}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </DarkGradientBackground>
  );
};

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
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 18,
  },
  faqCard: {
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 22,
  },
});

export default FAQScreen;
