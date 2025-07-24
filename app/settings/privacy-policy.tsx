"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DarkGradientBackground from '../../components/DarkGradientBackground';

const PrivacyPolicyScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Introduction</Text>
        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
          Welcome to Pallenote. We respect your privacy and are committed to protecting your personal data. This Privacy
          Policy explains how we collect, use, and safeguard your information.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Information We Collect</Text>
        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
          We may collect personal information you provide directly to us, such as your name, email address, and any
          notes or recordings you create in the app.
        </Text>
        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
          We also automatically collect usage data, device information, and log data to improve our services.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. How We Use Your Information</Text>
        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
          - To provide and maintain our services
          {'\n'}- To improve user experience and develop new features
          {'\n'}- To communicate with you about updates or support
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Data Sharing and Disclosure</Text>
        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
          We do not sell your personal information. We may share data with service providers who help us operate the app,
          under strict confidentiality agreements.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Data Security</Text>
        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
          We implement technical and organizational measures to protect your information. However, no internet
          transmission is 100% secure.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Your Rights</Text>
        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
          You may access, update, or delete your personal data by contacting us. You can also disable data collection
          through your device settings.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Children's Privacy</Text>
        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
          Our services are not intended for children under 13. We do not knowingly collect personal data from children.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Changes to This Policy</Text>
        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
          We may update this policy from time to time. We will notify you of any significant changes by posting a notice
          in the app.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>9. Contact Us</Text>
        <Text style={[styles.sectionText, { color: colors.textSecondary, marginBottom: 40 }]}>
          If you have questions or concerns about this Privacy Policy, please contact us at support@pallenoteapp.com.
        </Text>
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 2,
  },
});

export default PrivacyPolicyScreen;
