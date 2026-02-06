import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DebtorLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F7F9" }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SafeAreaView>
  );
}
