import 'react-native-reanimated';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTintColor: colors.ink, headerStyle: { backgroundColor: colors.paper }, contentStyle: { backgroundColor: colors.paper }, headerShadowVisible: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Welcome back' }} />
        <Stack.Screen name="(auth)/register" options={{ title: 'Create account' }} />
        <Stack.Screen name="community/index" options={{ title: 'Community' }} />
        <Stack.Screen name="community/[spaceId]" options={{ title: 'Community space' }} />
        <Stack.Screen name="community/report" options={{ title: 'Report a post' }} />
        <Stack.Screen name="support" options={{ title: 'Professional support' }} />
        <Stack.Screen name="myths" options={{ title: 'Myth Buster' }} />
      </Stack>
    </AuthProvider>
  );
}
