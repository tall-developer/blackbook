import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GlobalErrorBoundary from "../components/GlobalErrorBoundary";
import { DebtorsProvider } from "../context/DebtorsContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if already prevented by a fast refresh cycle.
});

const ONBOARDING_KEY = "bb:onboarding-complete";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    InterRegular: Inter_400Regular,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);
  const [fontLoadTimedOut, setFontLoadTimedOut] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setMinSplashElapsed(true), 250);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setFontLoadTimedOut(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadOnboardingFlag = async () => {
      try {
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!mounted) return;
        setShowOnboarding(done !== "true");
      } finally {
        if (mounted) setOnboardingChecked(true);
      }
    };
    void loadOnboardingFlag();
    return () => {
      mounted = false;
    };
  }, []);

  const canRenderApp = fontsLoaded || !!fontError || fontLoadTimedOut;
  const appReady = canRenderApp && minSplashElapsed && onboardingChecked;

  useEffect(() => {
    if (appReady) {
      void SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <DebtorsProvider>
            <GlobalErrorBoundary>
              <AppStack showOnboarding={showOnboarding} />
            </GlobalErrorBoundary>
          </DebtorsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppStack({ showOnboarding }: { showOnboarding: boolean }) {
  const { theme, colorScheme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack
        initialRouteName={showOnboarding ? "onboarding" : "(tabs)"}
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
