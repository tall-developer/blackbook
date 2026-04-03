import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebtors } from "../../context/DebtorsContext";
import { useTheme } from "../../context/ThemeContext";
import { parseIsoDateSafe, toDayStart } from "../../utils/date";

export default function SummaryScreen() {
  const { debtors, hydrated } = useDebtors();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (!hydrated) {
    return <View style={[styles.container, { backgroundColor: theme.background }]} />;
  }

  const formatCompact = (val: number) => {
    if (val >= 10000) {
      return `R${(val / 1000).toFixed(1)}K`;
    }

    return `R${val.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const totalBalance = debtors.reduce(
    (sum, d) => sum + Math.max((d.amount || 0) - (d.paidAmount || 0), 0),
    0,
  );
  const activeCount = debtors.filter((d) => d.status !== "Settled").length;
  const totalInterest = debtors.reduce(
    (sum, d) => sum + (d.interestAdded || Math.max((d.amount || 0) - (d.principalAmount || 0), 0)),
    0,
  );
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const overdueCount = debtors.filter((d) => {
    if (!d.dueDate || d.status === "Settled") return false;
    const due = parseIsoDateSafe(d.dueDate);
    return !!due && toDayStart(due).getTime() < todayStart.getTime();
  }).length;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top + 8 },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Summary</Text>
        </View>

        <View style={[styles.totalCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
            Total Owed to You
          </Text>
          <Text
            style={[styles.totalAmount, { color: theme.textPrimary }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            R{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.totalSubRow}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={theme.textSecondary}
            />
            <Text style={[styles.totalSub, { color: theme.textSecondary }]}>
              Includes current interest rates
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <MetricCard
            icon="trending-up"
            label="Interest"
            value={formatCompact(totalInterest)}
            theme={theme}
          />
          <MetricCard
            icon="people"
            label="Active"
            value={activeCount.toString()}
            theme={theme}
          />
          <MetricCard
            icon="alert-circle"
            label="Overdue"
            value={overdueCount.toString()}
            theme={theme}
            isAlert={overdueCount > 0}
          />
        </View>
      </ScrollView>

      <View style={[styles.floatingFooter, { bottom: 16 }]}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.textPrimary }]}
          onPress={() => router.push({ pathname: "/", params: { openAdd: "true" } })}
        >
          <Text style={[styles.buttonText, { color: theme.background }]}>+ Add New Debtor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MetricCard({ icon, label, value, theme, isAlert }: any) {
  return (
    <View
      style={[
        styles.metricCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: theme.background }]}>
        <Ionicons
          name={icon}
          size={18}
          color={isAlert ? "#FF5252" : theme.textSecondary}
        />
      </View>
      <Text
        style={[styles.metricValue, { color: theme.textPrimary }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "700" },
  totalCard: { borderRadius: 24, padding: 24, alignItems: "center", marginBottom: 20 },
  totalLabel: { fontSize: 16, fontWeight: "500" },
  totalAmount: { fontSize: 48, fontWeight: "700", marginVertical: 8 },
  totalSubRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  totalSub: { fontSize: 13 },
  metricsRow: { flexDirection: "row", justifyContent: "space-between" },
  metricCard: {
    width: "31%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  metricValue: { fontSize: 17, fontWeight: "700" },
  metricLabel: { fontSize: 12, fontWeight: "500" },
  floatingFooter: { position: "absolute", left: 16, right: 16 },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      android: { elevation: 4 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
});
