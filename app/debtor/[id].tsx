import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebtors } from "../../context/DebtorsContext";
import { useTheme } from "../../context/ThemeContext";

export default function DebtorProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { debtors } = useDebtors();
  const { theme } = useTheme();

  const debtor = id ? debtors.find((d) => d.id === id) : null;

  if (!debtor) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.notFound, { color: theme.textPrimary }]}>Debtor not found</Text>
      </SafeAreaView>
    );
  }

  const dueText = debtor.dueDate
    ? new Date(debtor.dueDate).toLocaleDateString()
    : "No due date";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{debtor.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{debtor.name}</Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Current loan</Text>
          <Text style={[styles.amount, { color: theme.textPrimary }]}>R{debtor.amount.toFixed(2)}</Text>
          <View style={styles.dueRow}>
            <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.dueText, { color: theme.textSecondary }]}>Due {dueText}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.addDebtRow} onPress={() => {}}>
            <View style={[styles.addIconCircle, { borderColor: theme.textSecondary }]}> 
              <Ionicons name="add" size={16} color={theme.textSecondary} />
            </View>
            <Text style={[styles.addDebtText, { color: theme.textSecondary }]}>Add more debt</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Payment History</Text>
          <View style={[styles.historyIconWrap, { backgroundColor: theme.input, borderColor: theme.border }]}> 
            <Ionicons name="cash-outline" size={30} color={theme.textSecondary} />
          </View>
          <Text style={[styles.historyText, { color: theme.textSecondary }]}>No payment history yet</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },
  content: {
    padding: 18,
    gap: 16,
    alignItems: "center",
    paddingBottom: 32,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  amount: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  dueText: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 16,
    opacity: 0.7,
  },
  addDebtRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addDebtText: {
    fontSize: 15,
    fontWeight: "600",
  },
  historyIconWrap: {
    marginTop: 12,
    marginBottom: 8,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  historyText: {
    fontSize: 13,
    textAlign: "center",
  },
  notFound: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
});
