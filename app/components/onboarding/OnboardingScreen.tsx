import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDebtors } from "../../../context/DebtorsContext";
import { useTheme } from "../../../context/ThemeContext";

export default function OnboardingScreen() {
  const { theme, colorScheme } = useTheme();
  const { interestRate, setInterestRate, completeOnboarding } = useDebtors();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: `${theme.primary}15` }]}>
          <Ionicons name="receipt-outline" size={42} color={theme.primary} />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Welcome to BlackBook
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Professionalize your lending. Set your standard monthly interest rate to get started.
        </Text>

        <View
          style={[
            styles.inputBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Global Interest Rate
          </Text>
          <View style={styles.row}>
            <TextInput
              value={String(interestRate)}
              onChangeText={(v) => setInterestRate(Number(v))}
              keyboardType="numeric"
              style={[styles.input, { color: theme.textPrimary }]}
              placeholderTextColor={theme.textSecondary}
            />
            <Text style={[styles.percent, { color: theme.primary }]}>%</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={() => {
            void completeOnboarding();
          }}
        >
          <Text style={{ 
            fontSize: 16, 
            fontWeight: "700", 
            color: colorScheme === "dark" ? "#1A1C1E" : "#FFFFFF"
          }}>
            Continue to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  card: { alignItems: "center" },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 10 },
  subtitle: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  inputBox: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 40,
  },
  label: { fontSize: 12, marginBottom: 4, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center" },
  input: { flex: 1, fontSize: 22, fontWeight: "700" },
  percent: { fontSize: 20, fontWeight: "800" },
  btn: {
    width: "100%",
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
});
