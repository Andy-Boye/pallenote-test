"use client"

import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DarkGradientBackground from '../../components/DarkGradientBackground';

const communityLinks = [
  {
    title: "Discord Server",
    description: "Join our Discord community for real-time discussions",
    icon: "chatbubbles-outline",
    members: "2.5k",
  },
  {
    title: "Reddit Community",
    description: "Share tips and tricks with fellow users",
    icon: "logo-reddit",
    members: "1.8k",
  },
  {
    title: "Facebook Group",
    description: "Connect with users and get updates",
    icon: "logo-facebook",
    members: "3.2k",
  },
  {
    title: "Twitter",
    description: "Follow us for the latest news and updates",
    icon: "logo-twitter",
    members: "5.1k",
  },
];

const CommunityScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Community</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Connect with other Pallenote users, share tips, and get help from our community</Text>
        {communityLinks.map((community, index) => (
          <View
            key={index}
            style={[styles.communityCard, { backgroundColor: colors.surface }]}
          >
            {/* Icon */}
            <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}> 
              <Ionicons name={community.icon as any} size={30} color={colors.primary} />
            </View>
            {/* Text Content */}
            <View style={{ flex: 1 }}>
              <Text style={[styles.communityTitle, { color: colors.text }]}>{community.title}</Text>
              <Text style={[styles.communityDescription, { color: colors.textSecondary }]}>{community.description}</Text>
              <Text style={[styles.communityMembers, { color: colors.primary }]}>{community.members} members</Text>
            </View>
            {/* Join Button */}
            <TouchableOpacity style={[styles.joinButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.joinButtonText, { color: colors.background }]}>Join</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 18,
  },
  communityCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  communityDescription: {
    fontSize: 14,
    marginBottom: 2,
  },
  communityMembers: {
    fontSize: 12,
    fontWeight: "bold",
  },
  joinButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 12,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CommunityScreen;
