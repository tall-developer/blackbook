import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

export default function TabsLayout() {
  const { theme, colorScheme } = useTheme();
  const tabBorder =
    colorScheme === "dark" ? "rgba(252,253,249,0.12)" : "rgba(0,0,0,0.06)";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.textPrimary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderTopColor: tabBorder,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="summary"
        options={{
          title: "Summary",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
