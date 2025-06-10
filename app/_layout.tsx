import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { TradingProvider } from '@/context/TradingContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <TradingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="options" />
        <Stack.Screen name="subscription" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </TradingProvider>
  );
}