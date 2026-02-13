import { useRouter } from "expo-router";
import { useState } from "react";
import {
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
  const [showPicker, setShowPicker] = useState(false);
  const [pendingDueDate, setPendingDueDate] = useState<string | undefined>(
    undefined,
  );
  const selectedDueDate = dueDate
    ? new Date(dueDate).toISOString().split("T")[0]
    : undefined;
  const todayDate = new Date().toISOString().split("T")[0];

  const submit = () => {
    if (!name || !amount) return;

    addDebtor(
      name.trim(),
      Number(amount),
      dueDate, // ✅ number | undefined
    );

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={-30}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.overlay,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(0,0,0,0.6)"
                  : "rgba(0,0,0,0.25)",
            },
          ]}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.card,
                borderColor: sheetBorder,
              },
            ]}
          >
            {/* Handle */}
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
            >
              <Text style={[styles.buttonText, { color: theme.background }]}>
                Save debtor
              </Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <Modal
        visible={showPicker}
        transparent
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
                        selectedColor: theme.primary,
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
                textDisabledColor: theme.textSecondary,
                todayTextColor: theme.primary,
              }}
            />
            <View style={styles.calendarActions}>
              <Pressable
                style={[styles.calendarActionBtn, { borderColor: theme.border }]}
                onPress={() => {
                  setPendingDueDate(undefined);
                  setDueDate(undefined);
                  setShowPicker(false);
                }}
              >
                <Text style={[styles.calendarActionText, { color: theme.textSecondary }]}>
                  Clear
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.calendarActionBtn,
                  { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                onPress={() => {
                  if (pendingDueDate) {
                    setDueDate(new Date(`${pendingDueDate}T00:00:00`).getTime());
                  }
                  setShowPicker(false);
                }}
              >
                <Text style={[styles.calendarActionText, { color: theme.background }]}>
                  Done
                </Text>
              </Pressable>
            </View>
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
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  sheet: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
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
