import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function InterestOnboarding({ navigation }: any) {
  const [interest, setInterest] = useState(10);

  const presets = [0, 5, 10, 15];

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Set your interest rate</Text>
      <Text style={styles.subtitle}>
        This will be applied to all debtors. You can change it later.
      </Text>

      {/* Interest Value */}
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{interest}%</Text>
      </View>

      {/* Slider */}
      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={0}
        maximumValue={30}
        step={1}
        value={interest}
        onValueChange={setInterest}
        minimumTrackTintColor="#111"
        maximumTrackTintColor="#DDD"
        thumbTintColor="#111"
      />

      {/* Presets */}
      <View style={styles.presets}>
        {presets.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.presetChip,
              interest === item && styles.presetActive,
            ]}
            onPress={() => setInterest(item)}
          >
            <Text
              style={[
                styles.presetText,
                interest === item && styles.presetTextActive,
              ]}
            >
              {item}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          // Save interest to storage later
          router.replace("/(tabs)");
        }}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 20,
    paddingTop: 80,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 40,
  },

  valueContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  value: {
    fontSize: 48,
    fontWeight: "700",
    color: "#111",
  },

  presets: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 40,
  },

  presetChip: {
    backgroundColor: "#EAEAEC",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
  },

  presetActive: {
    backgroundColor: "#111",
  },

  presetText: {
    color: "#555",
    fontWeight: "500",
  },

  presetTextActive: {
    color: "#FFF",
  },

  button: {
    backgroundColor: "#111",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
