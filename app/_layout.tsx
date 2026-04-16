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
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import PinKeypad from "./components/PinKeypad";
import GlobalErrorBoundary from "../components/GlobalErrorBoundary";
import { DebtorsProvider } from "../context/DebtorsContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if already prevented by a fast refresh cycle.
});

const ONBOARDING_KEY = "bb:onboarding-complete";
const PIN_KEY = "blackbook_pin";
const LEGACY_PIN_KEY = "blackbook_user_pin";
const SECURITY_ENABLED_KEY = "blackbook_biometric_enabled";
const LEGACY_SECURITY_ENABLED_KEY = "blackbook_security_enabled";

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
  const [appState, setAppState] = useState<"loading" | "locked" | "unlocked">(
    "loading",
  );
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState("");

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

  const checkSecurity = async () => {
    const [primaryPin, legacyPin, primarySecurity, legacySecurity] =
      await Promise.all([
        AsyncStorage.getItem(PIN_KEY),
        AsyncStorage.getItem(LEGACY_PIN_KEY),
        AsyncStorage.getItem(SECURITY_ENABLED_KEY),
        AsyncStorage.getItem(LEGACY_SECURITY_ENABLED_KEY),
      ]);

    const pin = primaryPin || legacyPin;
    const isSecurityEnabled =
      primarySecurity === "true" || legacySecurity === "true";

    if (isSecurityEnabled && pin) {
      setSavedPin(pin);
      setAppState("locked");
      return;
    }

    setSavedPin(null);
    setAppState("unlocked");
  };

  useEffect(() => {
    void checkSecurity();
  }, []);

  const validatePin = (candidatePin: string) => {
    if (savedPin && candidatePin === savedPin) {
      setEnteredPin("");
      setAppState("unlocked");
      return;
    }
    setEnteredPin("");
  };

  const checkPin = (num: string) => {
    const nextPin = (enteredPin + num).slice(0, 4);
    setEnteredPin(nextPin);

    if (nextPin.length === 4) {
      validatePin(nextPin);
    }
  };

  const deletePinDigit = () => {
    setEnteredPin((p) => p.slice(0, -1));
  };

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootGate
            appState={appState}
            enteredPin={enteredPin}
            checkPin={checkPin}
            onDeletePin={deletePinDigit}
            showOnboarding={showOnboarding}
          />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootGate({
  appState,
  enteredPin,
  checkPin,
  onDeletePin,
  showOnboarding,
}: {
  appState: "loading" | "locked" | "unlocked";
  enteredPin: string;
  checkPin: (num: string) => void;
  onDeletePin: () => void;
  showOnboarding: boolean;
}) {
  const { theme } = useTheme();

  if (appState === "loading") {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.textPrimary} />
      </View>
    );
  }

  if (appState === "locked") {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: "center",
        }}
      >
        <PinKeypad
          title="Enter BlackBook PIN"
          pin={enteredPin}
          onPress={checkPin}
          onDelete={onDeletePin}
          theme={theme}
        />
      </SafeAreaView>
    );
  }

  return (
    <DebtorsProvider>
      <GlobalErrorBoundary>
        <AppStack showOnboarding={showOnboarding} />
      </GlobalErrorBoundary>
    </DebtorsProvider>
  );
}

function AppStack({ showOnboarding }: { showOnboarding: boolean }) {
  const { theme } = useTheme();

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
