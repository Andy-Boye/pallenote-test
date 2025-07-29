"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import * as yup from "yup";
import DarkGradientBackground from '../../components/DarkGradientBackground';

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const schema = yup.object().shape({
  currentPassword: yup
    .string()
    .required("Current password is required"),
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm password is required"),
});

const ChangePasswordScreen = () => {
  const { colors } = useTheme();
  const { changePassword } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      Alert.alert(
        "Success", 
        "Password has been changed successfully.", 
        [
          {
            text: "OK",
            onPress: () => {
              reset();
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error", 
        error.response?.data?.message || error.message || "Failed to change password"
      );
    }
  };

  return (
    <DarkGradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Change Password</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.emoji, { fontSize: 60 }]}>🔐</Text>
          <Text style={[styles.title, { color: colors.text }]}>Change Password</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your current password and choose a new one
          </Text>

          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: errors.currentPassword ? 'red' : '#e0e0e0',
                  },
                ]}
                placeholder="Current password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.currentPassword && (
            <Text style={[styles.error, { color: 'red' }]}>
              {errors.currentPassword.message}
            </Text>
          )}

          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: errors.newPassword ? 'red' : '#e0e0e0',
                  },
                ]}
                placeholder="New password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.newPassword && (
            <Text style={[styles.error, { color: 'red' }]}>
              {errors.newPassword.message}
            </Text>
          )}

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: errors.confirmPassword ? 'red' : '#e0e0e0',
                  },
                ]}
                placeholder="Confirm new password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text style={[styles.error, { color: 'red' }]}>
              {errors.confirmPassword.message}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.button, 
              { backgroundColor: colors.primary },
              isSubmitting && { opacity: 0.7 }
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Changing Password...' : 'Change Password'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </DarkGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  emoji: {
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  input: {
    height: 54,
    borderRadius: 12,
    paddingHorizontal: 18,
    marginBottom: 16,
    fontSize: 15,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  error: {
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
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
});

export default ChangePasswordScreen;