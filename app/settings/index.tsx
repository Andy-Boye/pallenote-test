import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import DarkGradientBackground from '../../components/DarkGradientBackground';

export default function SettingsScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [facialRecognitionEnabled, setFacialRecognitionEnabled] = useState(false);

  const handleExportData = () => {
    Alert.alert("Export Data", "Your data has been exported successfully.");
  };

  const handleClearCache = () => {
    Alert.alert("Clear Cache", "Cache cleared successfully.");
  };

  const handleRecycleBin = () => {
    router.push('/recycle-bin');
  };

  return (
    <DarkGradientBackground>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 0 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.surface, gap: 16 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.text }}>Settings</Text>
        </View>

        {/* Theme Section */}
        <View style={{ marginBottom: 24, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 12 }}>
            Appearance
          </Text>
          <View
            style={{
              backgroundColor: isDarkMode ? "#222" : "#f4f4f4",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="moon" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={{ color: colors.text, fontSize: 16 }}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                thumbColor={isDarkMode ? colors.primary : "#ccc"}
                trackColor={{ false: "#ddd", true: colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* General Section */}
        <View style={{ marginBottom: 24, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 12 }}>
            General
          </Text>
          <View
            style={{
              backgroundColor: isDarkMode ? "#222" : "#f4f4f4",
              borderRadius: 12,
              paddingVertical: 8,
            }}
          >
            {/* Notifications */}
            <SettingRow
              icon="notifications"
              label="Notifications"
              value={notificationsEnabled}
              onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
            />

            {/* Auto Backup */}
            <SettingRow
              icon="cloud-upload"
              label="Auto Backup"
              value={autoBackupEnabled}
              onValueChange={() => setAutoBackupEnabled(!autoBackupEnabled)}
            />

            {/* Biometric Lock */}
            <SettingRow
              icon="finger-print"
              label="Biometric Lock"
              value={biometricEnabled}
              onValueChange={() => setBiometricEnabled(!biometricEnabled)}
            />

            {/* Facial Recognition */}
            <SettingRow
              icon="eye"
              label="Facial Recognition"
              value={facialRecognitionEnabled}
              onValueChange={() => setFacialRecognitionEnabled(!facialRecognitionEnabled)}
            />

            {/* Recycle Bin */}
            <TouchableOpacity
              onPress={handleRecycleBin}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 14,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="trash" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={{ color: colors.text, fontSize: 16 }}>Recycle Bin</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>

            {/* Export Data */}
            <TouchableOpacity
              onPress={handleExportData}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 14,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="download-outline" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={{ color: colors.text, fontSize: 16 }}>Export Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>

            {/* Clear Cache */}
            <TouchableOpacity
              onPress={handleClearCache}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 14,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="trash-outline" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={{ color: colors.text, fontSize: 16 }}>Clear Cache</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </DarkGradientBackground>
  );
}

/* Reusable Setting Row Component */
const SettingRow = ({ icon, label, value, onValueChange }: any) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={icon as any} size={22} color={colors.primary} style={{ marginRight: 10 }} />
        <Text style={{ color: colors.text, fontSize: 16 }}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? colors.primary : "#ccc"}
        trackColor={{ false: "#ddd", true: colors.primary }}
      />
    </View>
  );
};
