"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import DarkGradientBackground from '../../components/DarkGradientBackground'

const AccountInfoScreen = () => {
  const { colors } = useTheme()
  const { user, getAccountInfo, getAccountProfile, deleteAccount } = useAuth()
  const router = useRouter()
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [accountProfile, setAccountProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccountData()
  }, [])

  const loadAccountData = async () => {
    try {
      setLoading(true)
      // Try to get account info and profile
      const [info, profile] = await Promise.allSettled([
        getAccountInfo(),
        getAccountProfile()
      ])
      
      if (info.status === 'fulfilled') {
        setAccountInfo(info.value)
      }
      
      if (profile.status === 'fulfilled') {
        setAccountProfile(profile.value)
      }
    } catch (error) {
      console.error('Error loading account data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProfile = () => {
    router.push('/settings/edit-profile')
  }

  const handleChangePassword = () => {
    router.push('/settings/change-password')
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount()
              Alert.alert("Account Deleted", "Your account has been successfully deleted.")
              router.replace('/(auth)/login')
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete account")
            }
          }
        }
      ]
    )
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={[styles.userCard, { backgroundColor: colors.surface }]}> 
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}> 
            <Text style={[styles.avatarText, { color: colors.background }]}>
              {user.username?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}> 
            <Text style={[styles.userName, { color: colors.text }]}>
              {user.username || user.email}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user.email}
            </Text>
          </View>
        </View>

        {/* Account Details */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Username</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {user.username || 'Not set'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {user.email}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Member Since</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>

          {accountInfo && (
            <>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Account Status</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {accountInfo.status || 'Active'}
                </Text>
              </View>
              
              {accountInfo.lastLogin && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Last Login</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {new Date(accountInfo.lastLogin).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Actions */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>
          
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
          
          <TouchableOpacity style={[styles.action, { backgroundColor: colors.surface }]} onPress={loadAccountData}>
            <Ionicons name="refresh-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Refresh Data</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: '#d32f2f' }]}>Danger Zone</Text>
          
          <TouchableOpacity style={[styles.action, { backgroundColor: colors.surface }]} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={24} color="#d32f2f" />
            <Text style={[styles.actionText, { color: '#d32f2f' }]}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={20} color="#d32f2f" />
          </TouchableOpacity>
        </View>
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
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
})

export default AccountInfoScreen
