import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebtors } from "../../context/DebtorsContext";
import { useTheme } from "../../context/ThemeContext";

export default function DebtorProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { debtors, interestRate, recordPayment, startNewLoan } = useDebtors();
  const { theme, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const debtor = id ? debtors.find((d) => d.id === id) : undefined;
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [showNewLoanModal, setShowNewLoanModal] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [newLoanAmount, setNewLoanAmount] = React.useState("");

  const principal =
    debtor && typeof debtor.principalAmount === "number"
      ? debtor.principalAmount
      : (debtor?.amount ?? 0);
  const interestAdded =
    debtor && typeof debtor.interestAdded === "number"
      ? debtor.interestAdded
      : 0;
  const totalOwed = debtor?.amount ?? 0;
  const totalPaid = debtor?.paidAmount ?? 0;
  const currentBalance = Math.max(0, totalOwed - totalPaid);
  const isPaid = currentBalance === 0;
  const isPartial = !isPaid && totalPaid > 0;
  const latestPayment = debtor?.paymentHistory?.length
    ? debtor.paymentHistory[debtor.paymentHistory.length - 1]
    : undefined;
  const dueDateText = debtor?.dueDate
    ? new Date(debtor.dueDate).toLocaleDateString()
    : "No due date";
  const settledDateText = debtor?.settledAt
    ? new Date(debtor.settledAt).toLocaleDateString()
    : undefined;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const isDueDateOverdue =
    currentBalance > 0 && debtor?.dueDate
      ? new Date(debtor.dueDate).getTime() < todayStart.getTime()
      : false;
  const statusMeta = isPaid
    ? {
        title: "Paid in Full",
        subtitle: "Balance is fully settled",
        icon: "checkmark-circle",
        tone: "#10B981",
      }
    : isPartial
      ? {
          title: "Partially Paid",
          subtitle: "Balance is partially paid",
          icon: "time",
          tone: "#F59E0B",
        }
      : {
          title: "Unpaid",
          subtitle: "No payments recorded yet",
          icon: "alert-circle",
          tone: "#E53E3E",
        };

  const handleSubmitPayment = React.useCallback(() => {
    if (!debtor) return;
    const parsed = Number(paymentAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      Alert.alert("Invalid amount", "Enter a valid payment amount.");
      return;
    }
    const applied = recordPayment(debtor.id, parsed);
    if (applied <= 0) {
      Alert.alert("No payment applied", "This account is already fully paid.");
      return;
    }
    if (applied < parsed) {
      Alert.alert(
        "Partial application",
        `Only R${applied.toFixed(2)} was needed to settle this account.`,
      );
    }
    setPaymentAmount("");
    setShowPaymentModal(false);
  }, [debtor, paymentAmount, recordPayment]);

  const handleStartNewLoan = React.useCallback(() => {
    if (!debtor) return;
    const parsed = Number(newLoanAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      Alert.alert("Invalid amount", "Enter a valid principal amount.");
      return;
    }
    startNewLoan(debtor.id, parsed);
    setNewLoanAmount("");
    setShowNewLoanModal(false);
  }, [debtor, newLoanAmount, startNewLoan]);

  if (!debtor) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.notFoundWrap}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.notFoundText, { color: theme.textPrimary }]}>
            Debtor not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.topBar, { top: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 56, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View
            style={[styles.illustrationCircle, { backgroundColor: theme.card }]}
          >
            <Ionicons
              name={
                statusMeta.icon as React.ComponentProps<typeof Ionicons>["name"]
              }
              size={60}
              color={statusMeta.tone}
            />
          </View>
          <Text style={[styles.debtorName, { color: theme.textPrimary }]}>
            {debtor.name}
          </Text>
          <Text style={[styles.mainStatus, { color: statusMeta.tone }]}>
            R{currentBalance.toFixed(2)}
          </Text>
          <Text style={[styles.subStatus, { color: theme.textSecondary }]}>
            {statusMeta.subtitle}
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <DetailRow
            label="Amount Borrowed"
            value={`R${principal.toFixed(2)}`}
            theme={theme}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <DetailRow
            label="Extra Charge"
            value={`R${interestAdded.toFixed(2)}`}
            theme={theme}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <DetailRow
            label="Last Payment"
            value={
              latestPayment
                ? `${new Date(latestPayment.paidAt).toLocaleDateString()} \u2022 R${latestPayment.amount.toFixed(2)}`
                : "No payments yet"
            }
            theme={theme}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Payment Summary
        </Text>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <DetailRow
            label="Total Paid"
            value={`R${totalPaid.toFixed(2)}`}
            theme={theme}
          />

          {currentBalance > 0 && (
            <>
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
              <DetailRow
                label="Next Due Date"
                value={dueDateText}
                theme={theme}
                valueColor={isDueDateOverdue ? "#E53935" : theme.textPrimary}
              />
            </>
          )}

          {currentBalance <= 0 && settledDateText && (
            <>
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
              <DetailRow
                label="Settled On"
                value={settledDateText}
                theme={theme}
              />
            </>
          )}
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}
      >
        {currentBalance > 0 ? (
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: theme.textPrimary }]}
            onPress={() => setShowPaymentModal(true)}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
              Record Payment
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowNewLoanModal(true)}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
              Start New Loan
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showPaymentModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPaymentModal(false)}
        >
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Record Payment
            </Text>
            <Text style={[styles.modalHint, { color: theme.textSecondary }]}>
              Remaining: R{currentBalance.toFixed(2)}
            </Text>
            <TextInput
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.amountInput,
                {
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(252,253,249,0.06)"
                      : theme.input,
                },
              ]}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: theme.border }]}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text
                  style={[styles.modalBtnText, { color: theme.textSecondary }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleSubmitPayment}
              >
                <Text
                  style={[styles.modalBtnText, { color: theme.background }]}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showNewLoanModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowNewLoanModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNewLoanModal(false)}
        >
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Start New Loan
            </Text>
            <Text style={[styles.modalHint, { color: theme.textSecondary }]}>
              Enter the amount you are lending. We will add {interestRate}% on
              top.
            </Text>
            <TextInput
              value={newLoanAmount}
              onChangeText={setNewLoanAmount}
              keyboardType="numeric"
              placeholder="Enter loan amount"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.amountInput,
                {
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(252,253,249,0.06)"
                      : theme.input,
                },
              ]}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: theme.border }]}
                onPress={() => setShowNewLoanModal(false)}
              >
                <Text
                  style={[styles.modalBtnText, { color: theme.textSecondary }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleStartNewLoan}
              >
                <Text
                  style={[styles.modalBtnText, { color: theme.background }]}
                >
                  Start
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function DetailRow({ label, value, theme, valueColor }: any) {
  return (
    <View style={styles.detailRow}>
      <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{label}</Text>
      <Text
        style={{
          color: valueColor ?? theme.textPrimary,
          fontWeight: "600",
          fontSize: 14,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFoundWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  notFoundText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
  },
  topBar: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  headerSection: { alignItems: "center", marginTop: 40, marginBottom: 32 },
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  mainStatus: { fontSize: 32, fontWeight: "700", marginBottom: 4 },
  debtorName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  subStatus: { fontSize: 15 },
  infoCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  divider: { height: 1, width: "100%" },
  sectionTitle: {
    marginHorizontal: 18,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  mainButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalHint: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 13,
  },
  amountInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  modalBtn: {
    minWidth: 86,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
