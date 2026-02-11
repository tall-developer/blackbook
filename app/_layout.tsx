import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { DebtorsProvider } from "../context/DebtorsContext";
import { ThemeProvider } from "../context/ThemeContext";

// Note: Expo Go/dev clients can show startup UI that differs from production builds.
// Validate final splash behavior using preview/release builds.
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if already prevented by a fast refresh cycle.
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    InterRegular: Inter_400Regular,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinSplashElapsed(true), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsLoaded && minSplashElapsed) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, minSplashElapsed]);

  if (!fontsLoaded || !minSplashElapsed) return null;

  return (
    <ThemeProvider>
      <DebtorsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Tabs */}
          <Stack.Screen name="(tabs)" />

          {/* Modals */}
          <Stack.Screen
            name="(modals)"
            options={{
              presentation: "transparentModal",
            }}
          />

          {/* Other screens */}
          <Stack.Screen name="interest-onboarding" />
          <Stack.Screen name="DebtorProfile" />
          <Stack.Screen name="debtor" />
        </Stack>
      </DebtorsProvider>
    </ThemeProvider>
  );
}
