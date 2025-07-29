import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="account-info" />
      <Stack.Screen name="payment-plan" />
      <Stack.Screen name="language" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="community" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="about-us" />
    </Stack>
  );
} 