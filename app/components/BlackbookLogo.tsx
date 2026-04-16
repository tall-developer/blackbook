import {
    Inter_400Regular,
    Inter_800ExtraBold,
    useFonts,
} from "@expo-google-fonts/inter";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

/* ------------------ COMPONENT ------------------ */

type BlackbookLogoProps = {
  size?: number;
  blackColor?: string;
  bookColor?: string;
};

export default function BlackbookLogo({
  size = 40,
  blackColor,
  bookColor,
}: BlackbookLogoProps) {
  const { colorScheme } = useTheme();
  let [fontsLoaded] = useFonts({
    Inter_800ExtraBold,
    Inter_400Regular,
  });

  const resolvedBlackColor = blackColor ?? "#CFCFCF";
  const resolvedBookColor =
    bookColor ?? (colorScheme === "dark" ? "#FCFDF9" : "#000000");

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Text style={[styles.logo, { fontSize: size }]}>
      <Text style={[styles.bold, { color: resolvedBlackColor }]}>black</Text>
      <Text style={[styles.regular, { color: resolvedBookColor }]}>book</Text>
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
