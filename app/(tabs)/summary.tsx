import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Debtor, useDebtors } from "../../context/DebtorsContext";
import { useTheme } from "../../context/ThemeContext";
import { parseIsoDateSafe, toDayStart } from "../../utils/date";

export default function SummaryScreen() {
  const { debtors, interestRate, hydrated } = useDebtors();
  const { theme, colorScheme } = useTheme();
  const router = useRouter();
  const [showSkeleton, setShowSkeleton] = React.useState(true);

  React.useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => setShowSkeleton(false), 500);
    return () => clearTimeout(timer);
  }, [hydrated]);

  const totalBalance = debtors.reduce((sum, d) => sum + (d.amount || 0), 0);
  const principal =
    interestRate > 0
      ? totalBalance / (1 + interestRate / 100)
      : totalBalance;
  const interest = totalBalance - principal;

  const overdueCount = debtors.filter((d: Debtor) => {
    const hasDueDate = !!d.dueDate;
    const isSettled = d.status === "Settled";
    if (!hasDueDate || isSettled) return false;
    const due = parseIsoDateSafe(d.dueDate!);
    if (!due) return false;
    const dueStart = toDayStart(due);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return dueStart.getTime() < todayStart.getTime();
  }).length;

  if (!hydrated || showSkeleton) {
    return <SummarySkeleton />;
  }

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
        <View style={styles.totalSubRow}>
          <Ionicons
            name="sparkles-outline"
            size={14}
            color={theme.textSecondary}
          />
          <Text
            style={[
              styles.totalSub,
              { color: theme.textSecondary, opacity: 0.6 },
            ]}
          >
            Includes R{interest.toFixed(2)} interest
          </Text>
        </View>
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

            <Pressable
        style={[styles.primaryButton, { backgroundColor: theme.primary }]}
        onPress={() =>
          router.push({
            pathname: "/",
            params: { openAdd: "1" },
          })
        }
      >
        <Text style={[styles.primaryButtonText, { color: theme.background }]}> 
          + Add New Debtor
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

function SummarySkeleton() {
  const { theme, colorScheme } = useTheme();
  const router = useRouter();
  const pulse = React.useRef(new Animated.Value(0.55)).current;
  const skeletonBase =
    colorScheme === "dark" ? "rgba(252,253,249,0.12)" : "rgba(0,0,0,0.08)";

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[styles.skeletonTitle, { backgroundColor: skeletonBase, opacity: pulse }]}
      />
      <Animated.View
        style={[styles.skeletonTotalCard, { backgroundColor: skeletonBase, opacity: pulse }]}
      />
      <View style={styles.metricsRow}>
        <Animated.View
          style={[styles.skeletonMetricCard, { backgroundColor: skeletonBase, opacity: pulse }]}
        />
        <Animated.View
          style={[styles.skeletonMetricCard, { backgroundColor: skeletonBase, opacity: pulse }]}
        />
        <Animated.View
          style={[styles.skeletonMetricCard, { backgroundColor: skeletonBase, opacity: pulse }]}
        />
      </View>
      <Animated.View
        style={[styles.skeletonButton, { backgroundColor: skeletonBase, opacity: pulse }]}
      />
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
  skeletonTitle: {
    width: 120,
    height: 34,
    borderRadius: 8,
    marginBottom: 16,
  },
  skeletonTotalCard: {
    borderRadius: 20,
    height: 165,
    marginBottom: 16,
  },
  skeletonMetricCard: {
    borderRadius: 18,
    height: 118,
    width: "31%",
  },
  skeletonButton: {
    marginTop: 8,
    borderRadius: 18,
    height: 48,
  },
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
  totalSub: { color: "#777", fontSize: 13 },
  totalSubRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
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



