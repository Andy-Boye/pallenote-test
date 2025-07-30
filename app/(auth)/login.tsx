"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from '@/contexts/ThemeContext';
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
    TouchableOpacity
} from "react-native";
import * as yup from "yup";
import DarkGradientBackground from '../../components/DarkGradientBackground';

const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Minimum 6 characters").required("Password is required"),
});

const LoginScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      console.log('Login attempt with:', data.email);
      await signIn(data.email, data.password);
      console.log('Login successful, navigating to home');
      // Navigate to home screen after successful login
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert("Login Failed", "Invalid email or password");
    }
  };

  return (
    <DarkGradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <Text style={[styles.emoji, { fontSize: 90 }]}>🔒</Text>
          <Text style={[styles.title, { color: colors.primary }]}>Login</Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: errors.email ? 'red' : '#e0e0e0',
                  },
                ]}
                placeholder="Email"
                placeholderTextColor="#B0AEB8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.email && (
            <Text style={[styles.errorText, { color: 'red' }]}>{errors.email.message}</Text>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: errors.password ? 'red' : '#e0e0e0',
                  },
                ]}
                placeholder="Password"
                placeholderTextColor="#B0AEB8"
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.password && (
            <Text style={[styles.errorText, { color: 'red' }]}>{errors.password.message}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={[styles.link, { color: colors.primary }]}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={[styles.link, { color: colors.primary }]}>Forgot Password?</Text>
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
  errorText: {
    marginBottom: 8,
    fontSize: 13,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
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

export default LoginScreen;
