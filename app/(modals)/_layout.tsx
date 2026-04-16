import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "transparentModal",
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    />
  );
}
