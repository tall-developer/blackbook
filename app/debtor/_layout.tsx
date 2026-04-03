import { Stack } from "expo-router";
import { View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function DebtorLayout() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      />
    </View>
  );
}
