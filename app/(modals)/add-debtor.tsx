import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useDebtors } from "../../context/DebtorsContext";
import { useTheme } from "../../context/ThemeContext";

export default function AddDebtorModal() {
  const router = useRouter();
  const { addDebtor } = useDebtors();
  const { theme, colorScheme } = useTheme();
  const sheetBorder =
    colorScheme === "dark" ? "rgba(252,253,249,0.12)" : "rgba(0,0,0,0.06)";

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState<number | undefined>(undefined);
  const [addAlert, setAddAlert] = useState<{
    type: "none" | "loading" | "error";
    title: string;
    message: string;
  }>({
    type: "none",
    title: "",
    message: "",
  });
  const [showPicker, setShowPicker] = useState(false);
  const [pendingDueDate, setPendingDueDate] = useState<string | undefined>(
    undefined,
  );
  const selectedDueDate = dueDate
    ? new Date(dueDate).toISOString().split("T")[0]
    : undefined;
  const todayDate = new Date().toISOString().split("T")[0];

  const isAddingDebtor = addAlert.type === "loading";

  const submit = () => {
    if (!name || !amount || isAddingDebtor) return;
    const trimmedName = name.trim();
    const parsedAmount = Number(amount);
    if (!parsedAmount || Number.isNaN(parsedAmount)) return;

    setAddAlert({
      type: "loading",
      title: "Adding debtor...",
      message: "Saving details and preparing your record.",
    });

    setTimeout(() => {
      const result = addDebtor(trimmedName, parsedAmount, dueDate);
      if (!result.ok) {
        if (result.reason === "duplicate_name") {
          setAddAlert({
            type: "error",
            title: "Duplicate name",
            message: `"${trimmedName}" already exists. Please use a different name.`,
          });
          return;
        }
      }
      setAddAlert({ type: "none", title: "", message: "" });
      router.back();
    }, 650);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={-30}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => router.back()}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Pressable
            onPress={() => {}}
          style={[
            styles.sheet,
            {
              backgroundColor:
                colorScheme === "dark" ? theme.card : theme.card,
              borderColor: sheetBorder,
            },
          ]}
          >
            <View style={[styles.handle, { backgroundColor: theme.border }]} />

            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Add debtor
            </Text>

            <TextInput
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                {
                  backgroundColor: theme.input,
                  color: theme.textPrimary,
                  borderColor: sheetBorder,
                  borderWidth: 1,
                },
              ]}
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />

            <TextInput
              placeholder="Amount owed"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={[
                styles.input,
                {
                  backgroundColor: theme.input,
                  color: theme.textPrimary,
                  borderColor: sheetBorder,
                  borderWidth: 1,
                },
              ]}
              placeholderTextColor={theme.textSecondary}
            />

            {/* Due Date Picker */}
            <Pressable
              onPress={() => {
                setPendingDueDate(selectedDueDate);
                setShowPicker(true);
              }}
            >
              <View pointerEvents="none">
                <TextInput
                  placeholder="Due date"
                  value={
                    dueDate ? new Date(dueDate).toLocaleDateString("en-GB") : ""
                  }
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.input,
                      color: theme.textPrimary,
                      borderColor: sheetBorder,
                      borderWidth: 1,
                    },
                  ]}
                  placeholderTextColor={theme.textSecondary}
                  editable={false}
                />
              </View>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={submit}
              disabled={isAddingDebtor}
            >
              <Text style={[styles.buttonText, { color: theme.background }]}>
                Save debtor
              </Text>
            </Pressable>
          </Pressable>
        </TouchableWithoutFeedback>
      </Pressable>

      <Modal
        visible={showPicker}
        transparent={true}
        statusBarTranslucent={true}
        hardwareAccelerated={false}
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          style={styles.calendarOverlay}
          onPress={() => setShowPicker(false)}
        >
          <Pressable
            style={[styles.calendarCard, { backgroundColor: theme.card }]}
            onPress={() => {}}
          >
            <Calendar
              current={pendingDueDate ?? selectedDueDate}
              minDate={todayDate}
              markedDates={
                (pendingDueDate ?? selectedDueDate)
                  ? {
                      [(pendingDueDate ?? selectedDueDate) as string]: {
                        selected: true,
                        selectedColor:
                          colorScheme === "dark" ? "#2C7A7B" : theme.primary,
                        selectedTextColor: "#FCFDF9",
                      },
                    }
                  : undefined
              }
              onDayPress={(day: DateData) => {
                setPendingDueDate(day.dateString);
              }}
              theme={{
                calendarBackground: theme.card,
                dayTextColor: theme.textPrimary,
                monthTextColor: theme.textPrimary,
                arrowColor: theme.primary,
                textDisabledColor:
                  colorScheme === "dark" ? "rgba(252,253,249,0.28)" : "#B8C0CC",
                todayTextColor: theme.primary,
              }}
            />
            <View style={styles.calendarActions}>
              <Pressable
                style={[
                  styles.calendarActionBtn,
                  { borderColor: theme.border },
                ]}
                onPress={() => {
                  setPendingDueDate(undefined);
                  setDueDate(undefined);
                  setShowPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.calendarActionText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Clear
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.calendarActionBtn,
                  {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => {
                  if (pendingDueDate) {
                    setDueDate(
                      new Date(`${pendingDueDate}T00:00:00`).getTime(),
                    );
                  }
                  setShowPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.calendarActionText,
                    { color: theme.background },
                  ]}
                >
                  Done
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={addAlert.type !== "none"}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (addAlert.type !== "loading") {
            setAddAlert({ type: "none", title: "", message: "" });
          }
        }}
      >
        <Pressable
          style={styles.alertOverlay}
          onPress={() => {
            if (addAlert.type !== "loading") {
              setAddAlert({ type: "none", title: "", message: "" });
            }
          }}
        >
          <Pressable
            style={[styles.alertCard, { backgroundColor: theme.card }]}
            onPress={() => {}}
          >
            <View
              style={[
                styles.alertIconCircle,
                {
                  backgroundColor:
                    addAlert.type === "loading"
                      ? "rgba(56,189,248,0.2)"
                      : "rgba(234,179,8,0.2)",
                },
              ]}
            >
              {addAlert.type === "loading" ? (
                <ActivityIndicator size="small" color="#38BDF8" />
              ) : (
                <Text style={styles.warningIcon}>!</Text>
              )}
            </View>
            <Text style={[styles.alertTitle, { color: theme.textPrimary }]}>
              {addAlert.title}
            </Text>
            <Text style={[styles.alertMessage, { color: theme.textSecondary }]}>
              {addAlert.message}
            </Text>

            {addAlert.type === "error" ? (
              <Pressable
                style={[styles.alertAction, { backgroundColor: theme.primary }]}
                onPress={() =>
                  setAddAlert({ type: "none", title: "", message: "" })
                }
              >
                <Text
                  style={[styles.alertActionText, { color: theme.background }]}
                >
                  Try again
                </Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    width: "100%",
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  alertCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: "center",
  },
  alertIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  warningIcon: {
    fontSize: 24,
    lineHeight: 26,
    fontWeight: "700",
    color: "#EAB308",
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  alertMessage: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  alertAction: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  alertActionText: {
    fontSize: 14,
    fontWeight: "700",
  },
  calendarOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  calendarCard: {
    borderRadius: 16,
    overflow: "hidden",
    paddingBottom: 12,
  },
  calendarActions: {
    marginTop: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  calendarActionBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  calendarActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
