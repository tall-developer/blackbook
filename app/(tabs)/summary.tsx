import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Debtor, useDebtors } from "../../context/DebtorsContext";
import { useTheme } from "../../context/ThemeContext";

export default function SummaryScreen() {
  const { debtors, interestRate } = useDebtors();
  const { theme, colorScheme } = useTheme();

  const totalBalance = debtors.reduce((sum, d) => sum + (d.amount || 0), 0);
  const principal =
    interestRate > 0
      ? totalBalance / (1 + interestRate / 100)
      : totalBalance;
  const interest = totalBalance - principal;

  const overdueCount = debtors.filter((d: Debtor) => {
    const hasDueDate = !!d.dueDate;
    const isSettled = d.status === "Settled";
    return hasDueDate && new Date(d.dueDate!) < new Date() && !isSettled;
  }).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Summary</Text>
      </View>

      <View style={[styles.totalCard, { backgroundColor: theme.card }]}> 
        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}> 
          Total Owed to You
        </Text>
        <Text style={[styles.totalAmount, { color: theme.textPrimary }]}> 
          R{totalBalance.toFixed(2)}
        </Text>
        <Text
          style={[
            styles.totalSub,
            { color: theme.textSecondary, opacity: 0.6 },
          ]}
        >
          Includes R{interest.toFixed(2)} interest
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <View
          style={[
            styles.metricCard,
            styles.metricTintGreen,
            { borderColor: "rgba(255,255,255,0.08)" },
          ]}
        >
          <Ionicons
            name="stats-chart-outline"
            size={20}
            color={theme.textPrimary}
          />
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}> 
            R{interest.toFixed(2)}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}> 
            Interest Earned
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            styles.metricTintBlue,
            { borderColor: "rgba(255,255,255,0.08)" },
          ]}
        >
          <Ionicons name="people-outline" size={20} color={theme.textPrimary} />
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}> 
            {debtors.length}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}> 
            Active Debtors
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            colorScheme === "dark"
              ? styles.metricTintOverdueDark
              : styles.metricTintOverdueLight,
            { borderColor: "rgba(255,255,255,0.08)" },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={colorScheme === "dark" ? "#F87171" : "#E53935"}
          />
          <Text
            style={[
              styles.metricValue,
              { color: colorScheme === "dark" ? "#FCA5A5" : "#E53935" },
            ]}
          >
            {overdueCount}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}> 
            Overdue
          </Text>
        </View>
      </View>

      <Pressable style={[styles.primaryButton, { backgroundColor: theme.primary }]}> 
        <Text style={[styles.primaryButtonText, { color: theme.background }]}> 
          + Record Payment
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "600", color: "#111" },
  totalCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: { color: "#777", fontSize: 14 },
  totalAmount: {
    fontSize: 50,
    fontWeight: "600",
    marginVertical: 6,
    color: "#111",
  },
  totalSub: { color: "#777", fontSize: 13, marginTop: 16 },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    width: "31%",
    alignItems: "center",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 6,
    color: "#111",
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "400",
    color: "#777",
    marginTop: 4,
    textAlign: "center",
  },
  overdueText: { color: "#E53935" },
  metricTintGreen: {
    backgroundColor: "#1a3d2e15",
  },
  metricTintBlue: {
    backgroundColor: "#1a2d3d15",
  },
  metricTintOverdueDark: {
    backgroundColor: "rgba(239,68,68,0.14)",
  },
  metricTintOverdueLight: {
    backgroundColor: "rgba(229,57,53,0.08)",
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
