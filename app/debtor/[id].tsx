import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebtors } from "../../context/DebtorsContext";
import { useTheme } from "../../context/ThemeContext";

export default function DebtorProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { debtors, addMoreDebt, interestRate } = useDebtors();
  const { theme, colorScheme } = useTheme();
  const [showAddDebtModal, setShowAddDebtModal] = React.useState(false);
  const [extraAmount, setExtraAmount] = React.useState("");
  const [toastMessage, setToastMessage] = React.useState("");

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
  const dividerColor =
    colorScheme === "dark" ? "rgba(252,253,249,0.22)" : theme.border;
  const modalInputBorderColor =
    colorScheme === "dark" ? "rgba(252,253,249,0.26)" : theme.border;
  const modalInputBg =
    colorScheme === "dark" ? "rgba(252,253,249,0.06)" : theme.input;
  const extraAmountValue = Number(extraAmount);
  const extraAmountWithInterest =
    Number.isFinite(extraAmountValue) && extraAmountValue > 0
      ? extraAmountValue * (1 + interestRate / 100)
      : 0;

  const handleAddMoreDebt = () => {
    const parsed = Number(extraAmount);
    if (!parsed || parsed <= 0) return;
    addMoreDebt(debtor.id, parsed);
    setToastMessage(
      `Added R${extraAmountWithInterest.toFixed(2)} (incl ${interestRate}% interest)`,
    );
    setExtraAmount("");
    setShowAddDebtModal(false);
  };

  React.useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(""), 1800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.inner}>
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

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            <TouchableOpacity
              style={styles.addDebtRow}
              onPress={() => setShowAddDebtModal(true)}
            >
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
      </View>

      <Modal
        visible={showAddDebtModal}
        transparent
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setShowAddDebtModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={-30}
        >
          <Pressable
            style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}
            onPress={() => setShowAddDebtModal(false)}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
                  <View
                    style={[styles.modalHandle, { backgroundColor: theme.border }]}
                  />
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                    Add more debt
                  </Text>
                  <TextInput
                    placeholder="Amount"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={extraAmount}
                    onChangeText={setExtraAmount}
                    style={[
                      styles.modalInput,
                      {
                        color: theme.textPrimary,
                        backgroundColor: modalInputBg,
                        borderColor: modalInputBorderColor,
                      },
                    ]}
                  />
                  {extraAmountWithInterest > 0 && (
                    <Text style={[styles.previewText, { color: theme.textSecondary }]}>
                      Will add R{extraAmountWithInterest.toFixed(2)} (incl {interestRate}%)
                    </Text>
                  )}
                  <Pressable
                    style={[styles.modalButton, { backgroundColor: theme.primary }]}
                    onPress={handleAddMoreDebt}
                  >
                    <Text style={[styles.modalButtonText, { color: theme.background }]}>
                      Save
                    </Text>
                  </Pressable>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {toastMessage ? (
        <View style={[styles.toast, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.toastText, { color: theme.textPrimary }]}>{toastMessage}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "600",
    marginLeft: 8,
  },
  content: {
    paddingTop: 2,
    gap: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    width: "100%",
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalSheet: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  modalButton: {
    marginTop: 12,
    borderRadius: 12,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  previewText: {
    marginTop: 8,
    fontSize: 12,
  },
  toast: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toastText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
