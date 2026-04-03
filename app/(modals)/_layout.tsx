import { Stack } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function ModalLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
