"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React from "react"
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import DarkGradientBackground from '../../components/DarkGradientBackground'

const AccountInfoScreen = () => {
  const { colors } = useTheme()
  const { user } = useAuth()
  const router = useRouter()

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing functionality coming soon!")
  }

  const handleChangePassword = () => {
    Alert.alert("Change Password", "Password change functionality coming soon!")
  }

  if (!user) {
    return (
      <DarkGradientBackground>
        <View style={[styles.header, { backgroundColor: colors.surface }]}> 
          <TouchableOpacity onPress={() => router.back()}> 
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Account Info</Text>
        </View>
        <View style={styles.centeredContent}>
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
            No user data available
          </Text>
        </View>
      </DarkGradientBackground>
    )
  }

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity onPress={() => router.back()}> 
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Account Info</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* User Info */}
        <View style={[styles.userCard, { backgroundColor: colors.surface }]}> 
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}> 
            <Text style={[styles.avatarText, { color: colors.background }]}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}> 
            <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>User ID</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{user.id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Member Since</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</Text>
        </View>

        {/* Actions */}
        <TouchableOpacity style={[styles.action, { backgroundColor: colors.surface }]} onPress={handleEditProfile}>
          <Ionicons name="person-outline" size={24} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.text }]}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.action, { backgroundColor: colors.surface }]} onPress={handleChangePassword}>
          <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.text }]}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
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
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  detailLabel: {
    fontSize: 15,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginLeft: 16,
  },
})

export default AccountInfoScreen
