import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDebtors } from "../../src/context/DebtorsContext";
import { useTheme } from "../../src/context/ThemeContext";

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
            <Pressable onPress={() => setShowPicker(true)}>
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

            {showPicker && (
              <DateTimePicker
                value={dueDate ? new Date(dueDate) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowPicker(false);

                  if (selectedDate) {
                    setDueDate(selectedDate.getTime());
                  }
                }}
              />
            )}

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
});
