import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
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

/* ---------------- PROVIDER ---------------- */

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = Appearance.getColorScheme();

  const [mode, setMode] = useState<ThemeMode>("system");
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(systemScheme);

  /* Sync with system / user preference */
  useEffect(() => {
    if (mode === "system") {
      setColorScheme(systemScheme);
    } else {
      setColorScheme(mode);
    }
  }, [mode, systemScheme]);

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
