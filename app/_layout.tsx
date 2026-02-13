import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DebtorsProvider } from "../context/DebtorsContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <DebtorsProvider>
          <AppStack />
        </DebtorsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AppStack() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack
        initialRouteName="onboarding"
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: "transparentModal",
            sheetAllowedDetents: [0.45],
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen name="interest-onboarding" />
        <Stack.Screen name="DebtorProfile" />
        <Stack.Screen name="debtor" />
      </Stack>
    </View>
  );
}
