"use client";

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

const ProfileScreen = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-5" style={{ backgroundColor: colors.background }}>
      <Text className="text-2xl font-bold mb-5" style={{ color: colors.text }}>
        Profile
      </Text>

      <View className="w-20 h-20 rounded-full bg-gray-300 mb-5 items-center justify-center">
        <Text className="text-xl text-white font-bold">
          {user?.name?.charAt(0) || "U"}
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-base mb-1" style={{ color: colors.text }}>
          Name: {user.name}
        </Text>
        <Text className="text-base" style={{ color: colors.text }}>
          Email: {user.email}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/settings/account-info")}
        className="rounded-lg mb-3 py-3"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-center text-white font-medium">
          Edit Account Info
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={logout}
        className="rounded-lg py-3"
        style={{ backgroundColor: "red" }}
      >
        <Text className="text-center text-white font-medium">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;
