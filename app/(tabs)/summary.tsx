import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebtors, Debtor } from "../../src/context/DebtorsContext";
import { useTheme } from "../../src/context/ThemeContext";

export default function SummaryScreen() {
  const { debtors } = useDebtors();
  const { theme } = useTheme();

  const totalBalance = debtors.reduce((sum, d) => sum + (d.amount || 0), 0);
  const interest = totalBalance * 0.3; // 30% interest

  const overdueCount = debtors.filter((d: Debtor) => {
    const hasDueDate = !!d.dueDate;
    const isSettled = d.status === "Settled";
    return hasDueDate && new Date(d.dueDate!) < new Date() && !isSettled;
  }).length;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Summary
        </Text>
      </View>

      {/* Total Summary Card */}
      <View style={[styles.totalCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
          Total Outstanding
        </Text>
        <Text style={[styles.totalAmount, { color: theme.textPrimary }]}>
          R{(totalBalance + interest).toFixed(2)}
        </Text>
        <Text style={[styles.totalSub, { color: theme.textSecondary }]}>
          Includes R{interest.toFixed(2)} interest
        </Text>
      </View>

      {/* Metrics */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
          <Ionicons name="trending-up-outline" size={20} color={theme.textPrimary} />
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
            R{interest.toFixed(2)}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Interest Earned
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
          <Ionicons name="people-outline" size={20} color={theme.textPrimary} />
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
            {debtors.length}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Active Debtors
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
          <Ionicons name="alert-circle-outline" size={20} color="#E53935" />
          <Text style={[styles.metricValue, styles.overdueText]}>
            {overdueCount}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Overdue
          </Text>
        </View>
      </View>

      {/* Insight */}
      <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={theme.textSecondary}
        />
        <Text style={[styles.insightText, { color: theme.textSecondary }]}>
          You earned R{interest.toFixed(2)} interest this cycle
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 16,
    paddingTop: 40,
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
    fontSize: 34,
    fontWeight: "700",
    marginVertical: 6,
    color: "#111",
  },
  totalSub: { color: "#777", fontSize: 13 },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingVertical: 16,
    width: "31%",
    alignItems: "center",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
    color: "#111",
  },
  metricLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
    textAlign: "center",
  },
  overdueText: { color: "#E53935" },
  insightCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  insightText: {
    marginLeft: 8,
    color: "#555",
    fontSize: 13,
    flex: 1,
  },
});
