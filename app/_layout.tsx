import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { DebtorsProvider } from "../context/DebtorsContext";
import { ThemeProvider } from "../context/ThemeContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    InterRegular: Inter_400Regular,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
              sheetAllowedDetents: [0.45],
              contentStyle: { backgroundColor: "transparent" },
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
