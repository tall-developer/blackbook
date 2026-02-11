import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, ColorSchemeName } from "react-native";

import { LightTheme, DarkTheme } from "../theme/colors";

/* ---------------- TYPES ---------------- */

export type ThemeMode = "system" | "light" | "dark";

type ThemeContextType = {
  mode: ThemeMode;
  colorScheme: ColorSchemeName;
  setMode: (mode: ThemeMode) => void;
  theme: typeof LightTheme;
};

/* ---------------- CONTEXT ---------------- */

const ThemeContext = createContext<ThemeContextType | null>(null);
const THEME_MODE_KEY = "bb:theme-mode";

/* ---------------- PROVIDER ---------------- */

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = Appearance.getColorScheme();

  const [mode, setMode] = useState<ThemeMode>("system");
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(systemScheme);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_MODE_KEY);
        if (!mounted) return;
        if (
          storedMode === "system" ||
          storedMode === "light" ||
          storedMode === "dark"
        ) {
          setMode(storedMode);
        }
      } catch {
        // Fall back to default mode if storage read fails.
      } finally {
        if (mounted) setHydrated(true);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  /* Sync with system / user preference */
  useEffect(() => {
    if (mode === "system") {
      setColorScheme(systemScheme);
    } else {
      setColorScheme(mode);
    }
  }, [mode, systemScheme]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(THEME_MODE_KEY, mode);
  }, [mode, hydrated]);

  /* Select active theme */
  const theme = colorScheme === "dark" ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colorScheme,
        setMode,
        theme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/* ---------------- HOOK ---------------- */

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
