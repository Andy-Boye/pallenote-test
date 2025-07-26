"use client";

import { resetPassword } from "@/api/authApi";
import { useTheme } from "@/contexts/ThemeContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocalSearchParams, useRouter } from "expo-router";
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
} from "react-native";
import * as yup from "yup";
import DarkGradientBackground from '../../components/DarkGradientBackground';

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm password is required"),
});

const ResetPasswordScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { token, email } = useLocalSearchParams<{ token?: string; email?: string }>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      Alert.alert("Error", "Reset token is missing or invalid.");
      return;
    }

    try {
      await resetPassword(token, data.newPassword);
      Alert.alert("Success", "Password has been reset.", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Reset failed");
    }
  };

  return (
    <DarkGradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <Text style={[styles.emoji, { fontSize: 90 }]}>🔄</Text>
          <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>

          <TouchableOpacity
            style={{ alignSelf: 'flex-end', marginTop: 12, marginRight: 12, padding: 6, borderRadius: 8, backgroundColor: colors.accent }}
            onPress={() => router.push('/(auth)/reset-validation')}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '500' }}>Go to Validation</Text>
          </TouchableOpacity>

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
            <Text style={styles.error}>{errors.newPassword.message}</Text>
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
                placeholder="Confirm password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text style={styles.error}>{errors.confirmPassword.message}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </DarkGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 90,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ResetPasswordScreen;
