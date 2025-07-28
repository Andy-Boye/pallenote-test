"use client";

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import DarkGradientBackground from '../../components/DarkGradientBackground';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      await forgotPassword(email);
      Alert.alert("Check your email", "Password reset instructions sent");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send reset email");
    }
  };

  return (
    <DarkGradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={{ alignSelf: 'flex-end', marginTop: 12, marginRight: 12, padding: 6, borderRadius: 8, backgroundColor: colors.accent }}
            onPress={() => router.push('/(auth)/reset-password')}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '500' }}>Go to Reset Password</Text>
          </TouchableOpacity>
          <Text style={[styles.emoji, { fontSize: 90 }]}>🔑</Text>
          <Text style={[styles.title, { color: colors.primary }]}>Forgot Password</Text>

          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text, borderColor: '#e0e0e0' },
            ]}
            placeholder="Enter your email"
            placeholderTextColor="#B0AEB8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleForgotPassword}
          >
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.link, { color: colors.primary }]}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </DarkGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 90,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 18,
  },
  input: {
    height: 54,
    borderRadius: 12,
    paddingHorizontal: 18,
    marginBottom: 14,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  link: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },
});

export default ForgotPasswordScreen;
