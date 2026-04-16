import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PinKeypadProps {
  pin: string;
  onPress: (num: string) => void;
  onDelete: () => void;
  theme: any;
  title: string;
  subtitle?: string;
}

export default function PinKeypad({
  pin,
  onPress,
  onDelete,
  theme,
  title,
  subtitle,
}: PinKeypadProps) {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "DEL"];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {subtitle}
        </Text>
      ) : null}

      {/* Visual Dots */}
      <View style={styles.dotsContainer}>
        {[1, 2, 3, 4].map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { borderColor: theme.primary },
              pin.length > i && { backgroundColor: theme.primary },
            ]}
          />
        ))}
      </View>

      {/* Number Pad */}
      <View style={styles.grid}>
        {digits.map((item, index) => {
          if (item === "") return <View key={index} style={styles.key} />;

          return (
            <TouchableOpacity
              key={index}
              style={styles.key}
              onPress={() => (item === "DEL" ? onDelete() : onPress(item))}
            >
              {item === "DEL" ? (
                <Ionicons
                  name="backspace-outline"
                  size={28}
                  color={theme.textPrimary}
                />
              ) : (
                <Text style={[styles.keyText, { color: theme.textPrimary }]}>
                  {item}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", width: "100%" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 22 },
  dotsContainer: { flexDirection: "row", gap: 20, marginBottom: 50 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 280,
    justifyContent: "center",
  },
  key: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  keyText: { fontSize: 28, fontWeight: "600" },
});
