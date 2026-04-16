import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";

export default function FirstDebtorHint({ onDismiss }: { onDismiss: () => void }) {
  const { theme } = useTheme();
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [bounceAnim]);

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={[styles.bubble, { backgroundColor: theme.primary }]}>
        <Text style={styles.text}>Your ledger is empty!</Text>
        <Text style={styles.subText}>Tap below to record your first loan.</Text>
        <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
          <Text style={styles.closeText}>Got it</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.arrowContainer, { transform: [{ translateY: bounceAnim }] }]}>
        <Ionicons name="arrow-down" size={40} color={theme.primary} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 160,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  bubble: {
    padding: 24,
    borderRadius: 24,
    width: "85%",
    alignItems: "center",
    elevation: 10,
  },
  text: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  subText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
  },
  closeBtn: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
  },
  closeText: { color: "#FFFFFF", fontWeight: "700" },
  arrowContainer: { marginTop: 15 },
});
