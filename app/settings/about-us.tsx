"use client"

import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DarkGradientBackground from '../../components/DarkGradientBackground';

const teamMembers = [
  {
    name: "Group 57",
    role: "Development Team",
    icon: "people-outline",
  },
  {
    name: "Lead Developer",
    role: "Technical Architecture",
    icon: "code-slash-outline",
  },
  {
    name: "UI/UX Designer",
    role: "User Experience",
    icon: "color-palette-outline",
  },
];

const AboutUsScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About Us</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo & App Info */}
        <View style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}> 
            <Text style={[styles.logoText, { color: colors.background }]}>P</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>PALLENOTE</Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
        </View>
        {/* Mission Section */}
        <View style={styles.sectionSpacing}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Mission</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>Pallenote is designed to help you capture, organize, and access your ideas effortlessly. We believe that great ideas shouldn't be lost, and our app provides the perfect platform to keep your thoughts organized and accessible across all your devices.</Text>
        </View>
        {/* Team Section */}
        <View style={styles.sectionSpacing}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Meet Our Team</Text>
          {teamMembers.map((member, index) => (
            <View
              key={index}
              style={[styles.teamCard, { backgroundColor: colors.surface }]}
            >
              <Ionicons
                name={member.icon as any}
                size={40}
                color={colors.primary}
                style={{ marginRight: 16 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.teamName, { color: colors.text }]}>{member.name}</Text>
                <Text style={[styles.teamRole, { color: colors.textSecondary }]}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>
        {/* Contact Section */}
        <View style={styles.sectionSpacing}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
          <View style={[styles.contactCard, { backgroundColor: colors.surface }]}> 
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={24} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>support@pallenote.com</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="globe-outline" size={24} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>www.pallenote.com</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="logo-twitter" size={24} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>@pallenote</Text>
            </View>
          </View>
        </View>
        <View style={{ height: 40 }} />
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
  logoSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 38,
    fontWeight: "bold",
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 2,
  },
  sectionSpacing: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  teamCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  teamRole: {
    fontSize: 13,
  },
  contactCard: {
    borderRadius: 14,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    marginLeft: 14,
  },
});

export default AboutUsScreen;
