import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebtors } from "../../context/DebtorsContext";
import { useTheme } from "../../context/ThemeContext";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DebtorProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    debtors,
    interestRate,
    recordPayment,
    startNewLoan,
    updateLoanAmount,
  } = useDebtors();
  const { theme, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();

  const debtor = id ? debtors.find((d) => d.id === id) : undefined;

  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [showNewLoanModal, setShowNewLoanModal] = React.useState(false);
  const [showEditLoanModal, setShowEditLoanModal] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [newLoanAmount, setNewLoanAmount] = React.useState("");
  const [editLoanAmount, setEditLoanAmount] = React.useState("");
  const [historyExpanded, setHistoryExpanded] = React.useState(false);

  const principal = debtor?.principalAmount ?? debtor?.amount ?? 0;
  const interestAdded = debtor?.interestAdded ?? 0;
  const currentBalance = Math.max(
    0,
    (debtor?.amount ?? 0) - (debtor?.paidAmount ?? 0),
  );

  const isPaid = currentBalance === 0;
  const isPartial = !isPaid && (debtor?.paidAmount ?? 0) > 0;

  const statusMeta = isPaid
    ? {
        title: "Paid in Full",
        subtitle: "Balance is fully settled",
        icon: "checkmark-circle",
        tone: "#10B981",
        badge: "Settled",
      }
    : isPartial
      ? {
          title: "Partially Paid",
          subtitle: "Balance is partially paid",
          icon: "time",
          tone: "#F59E0B",
          badge: "In Progress",
        }
      : {
          title: "Unpaid",
          subtitle: "No payments recorded yet",
          icon: "alert-circle",
          tone: "#E53E3E",
          badge: "Pending",
        };

  const toggleHistory = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHistoryExpanded(!historyExpanded);
  };

  // Around Line 92
  const handleEditLoan = () => {
    if (!debtor) return;

    const parsed = Number(editLoanAmount);
    console.log("Attempting to update to:", parsed); // Check your terminal for this!

    if (!Number.isFinite(parsed) || parsed <= 0) {
      Alert.alert("Invalid amount", "Enter a valid principal amount.");
      return;
    }

    updateLoanAmount(debtor.id, parsed);
    setShowEditLoanModal(false);
    setEditLoanAmount("");
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
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 56, paddingBottom: 120 }}
      >
        <View style={styles.headerSection}>
          <View
            style={[styles.illustrationCircle, { backgroundColor: theme.card }]}
          >
            <Ionicons
              name={statusMeta.icon as any}
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

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusMeta.tone + "15" },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusMeta.tone }]}
            />
            <Text
              style={[
                styles.subStatus,
                { color: statusMeta.tone, fontWeight: "600" },
              ]}
            >
              {statusMeta.badge}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              setEditLoanAmount(principal.toString());
              setShowEditLoanModal(true);
            }}
          >
            <DetailRow
              label="Amount Borrowed"
              value={`R${principal.toFixed(2)}`}
              theme={theme}
            />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <DetailRow
            label="Extra Charge"
            value={`R${interestAdded.toFixed(2)}`}
            theme={theme}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            onPress={toggleHistory}
            activeOpacity={0.7}
            style={styles.historyToggleRow}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="time-outline"
                size={18}
                color={theme.textSecondary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                History & Timeline
              </Text>
            </View>
            <Ionicons
              name={historyExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          {historyExpanded && (
            <View style={styles.timelineContainer}>
              {debtor.paymentHistory && debtor.paymentHistory.length > 0 ? (
                debtor.paymentHistory.map((item, index) => {
                  const isDebt = item.type === "debt";
                  const isLast = index === debtor.paymentHistory.length - 1;
                  return (
                    <View key={item.id} style={styles.timelineItem}>
                      <View style={styles.timelineLeftColumn}>
                        <View
                          style={[
                            styles.lineSegment,
                            {
                              backgroundColor:
                                index === 0 ? "transparent" : theme.border,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.timelineCircle,
                            {
                              backgroundColor: isDebt
                                ? theme.primary
                                : "#10B98120",
                              borderColor: isDebt ? theme.primary : "#10B981",
                            },
                          ]}
                        >
                          <Ionicons
                            name={isDebt ? "briefcase" : "cash"}
                            size={10}
                            color={isDebt ? theme.background : "#10B981"}
                          />
                        </View>
                        <View
                          style={[
                            styles.lineSegment,
                            {
                              backgroundColor: isLast
                                ? "transparent"
                                : theme.border,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.timelineRightColumn}>
                        <View style={styles.timelineHeader}>
                          <Text
                            style={[
                              styles.timelineTitle,
                              { color: theme.textPrimary },
                            ]}
                          >
                            {isDebt ? "Loan Started" : "Payment"}
                          </Text>
                          <Text
                            style={[
                              styles.timelineDate,
                              { color: theme.textSecondary },
                            ]}
                          >
                            {new Date(item.paidAt).toLocaleDateString("en-ZA", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.timelineSubtitle,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {isDebt
                            ? `Initial: R${item.amount.toFixed(2)}`
                            : `Paid: R${item.amount.toFixed(2)}`}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyHistory}>
                  No timeline data available
                </Text>
              )}
            </View>
          )}
        </View>

        {!isPaid && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Loan Schedule
            </Text>
            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <DetailRow
                label="Total Paid"
                value={`R${(debtor.paidAmount ?? 0).toFixed(2)}`}
                theme={theme}
              />
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
              <DetailRow
                label="Due Date"
                value={
                  debtor.dueDate
                    ? new Date(debtor.dueDate).toLocaleDateString()
                    : "Not set"
                }
                theme={theme}
              />
            </View>
          </>
        )}

        {isPaid && debtor.settledAt && (
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: theme.card,
                borderColor: "#10B981",
                marginTop: 10,
              },
            ]}
          >
            <Text
              style={{
                color: "#10B981",
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              Account settled on{" "}
              {new Date(debtor.settledAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}
      >
        <TouchableOpacity
          style={[
            styles.mainButton,
            { backgroundColor: isPaid ? theme.primary : theme.textPrimary },
          ]}
          onPress={() =>
            isPaid ? setShowNewLoanModal(true) : setShowPaymentModal(true)
          }
        >
          <Text style={[styles.buttonText, { color: theme.background }]}>
            {isPaid ? "Start New Loan" : "Record Payment"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Loan Modal */}
      <Modal
        visible={showEditLoanModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowEditLoanModal(false)}
        >
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={(e) => e.stopPropagation()} // This prevents accidental saves
          >
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Update Borrowed Amount
            </Text>
            <TextInput
              value={editLoanAmount}
              onChangeText={setEditLoanAmount}
              keyboardType="numeric"
              style={[
                styles.amountInput,
                {
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  marginTop: 12,
                },
              ]}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: theme.border }]}
                onPress={() => setShowEditLoanModal(false)}
              >
                <Text
                  style={[styles.modalBtnText, { color: theme.textSecondary }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleEditLoan}
              >
                <Text
                  style={[styles.modalBtnText, { color: theme.background }]}
                >
                  Update
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="fade"
        statusBarTranslucent
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

      {/* New Loan Modal */}
      <Modal
        visible={showNewLoanModal}
        transparent
        animationType="fade"
        statusBarTranslucent
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
              Enter amount. We add {interestRate}% on top.
            </Text>
            <TextInput
              value={newLoanAmount}
              onChangeText={setNewLoanAmount}
              keyboardType="numeric"
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
  container: {
    flex: 1,
  },
  topBar: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  headerSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 32,
  },
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  debtorName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  mainStatus: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  subStatus: {
    fontSize: 13,
  },
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
  divider: {
    height: 1,
    width: "100%",
  },
  historyToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },

  // Timeline Styles
  timelineContainer: {
    paddingVertical: 8,
  },
  timelineItem: {
    flexDirection: "row",
    height: 70,
  },
  timelineLeftColumn: {
    alignItems: "center",
    width: 30,
    marginRight: 10,
  },
  lineSegment: {
    width: 1.5,
    flex: 1,
  },
  timelineCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
  },
  timelineRightColumn: {
    flex: 1,
    paddingTop: 4,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  timelineDate: {
    fontSize: 12,
  },
  timelineSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },

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
  },
  mainButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
  notFoundWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 18, fontWeight: "600", marginTop: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: { width: "100%", borderRadius: 20, borderWidth: 1, padding: 18 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalHint: { marginTop: 6, marginBottom: 12, fontSize: 13 },
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
  emptyHistory: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 16,
  },
});
