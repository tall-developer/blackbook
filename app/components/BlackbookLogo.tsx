import {
  Inter_400Regular,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";
import React from "react";
import { StyleSheet, Text } from "react-native";

/* ------------------ COMPONENT ------------------ */


export default function BlackbookLogo({
  size = 40,
  blackColor = "#CFCFCF",
  bookColor = "#000",
}) {
  let [fontsLoaded] = useFonts({
    Inter_800ExtraBold,
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Text style={[styles.logo, { fontSize: size }]}>
      <Text style={[styles.bold, { color: blackColor }]}>black</Text>
      <Text style={[styles.regular, { color: bookColor }]}>book</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  logo: {
    letterSpacing: -1,
  },
  bold: {
    fontFamily: "Inter_800ExtraBold",
  },
  regular: {
    fontFamily: "Inter_400Regular",
  },
});
