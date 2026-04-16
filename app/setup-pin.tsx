import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import PinKeypad from "./components/PinKeypad";
import { useTheme } from "../context/ThemeContext";

const PIN_KEY = "blackbook_user_pin";
const SECURITY_ENABLED_KEY = "blackbook_security_enabled";
const PIN_KEY_CURRENT = "blackbook_pin";
const SECURITY_ENABLED_KEY_CURRENT = "blackbook_biometric_enabled";

export default function SetupPinScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [pin, setPin] = useState("");
  const [tempPin, setTempPin] = useState("");

  const saveAndFinish = async (finalPin: string) => {
    try {
      await AsyncStorage.multiSet([
        [PIN_KEY, finalPin],
        [SECURITY_ENABLED_KEY, "true"],
        [PIN_KEY_CURRENT, finalPin],
        [SECURITY_ENABLED_KEY_CURRENT, "true"],
      ]);
      Alert.alert("Success", "Your BlackBook PIN is now active.");
      router.back();
    } catch {
      Alert.alert("Error", "Could not save PIN.");
    }
  };

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === 4) {
        if (step === "create") {
          setTimeout(() => {
            setTempPin(newPin);
            setPin("");
            setStep("confirm");
          }, 300);
        } else if (newPin === tempPin) {
          void saveAndFinish(newPin);
        } else {
          Alert.alert("Error", "PINs do not match. Please start over.");
          setPin("");
          setTempPin("");
          setStep("create");
        }
      }
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <PinKeypad
          title={step === "create" ? "Create a PIN" : "Confirm your PIN"}
          subtitle={
            step === "create"
              ? "Choose a 4-digit code to secure your data"
              : "Re-enter your code to verify"
          }
          pin={pin}
          onPress={handlePress}
          onDelete={() => setPin((prev) => prev.slice(0, -1))}
          theme={theme}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 10 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  content: { flex: 1, justifyContent: "center", paddingBottom: 40 },
});
