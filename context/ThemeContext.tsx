/**
 * ThemeContext — light / dark / system theme with AsyncStorage persistence.
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeColors {
  // Backgrounds
  bg: string;
  card: string;
  surface: string;
  inputBg: string;
  headerBg: string;
  // Text
  text: string;
  textSec: string;
  textMuted: string;
  textPlaceholder: string;
  // Borders
  border: string;
  borderStrong: string;
  // Accent (indigo)
  accent: string;
  accentBg: string;
  accentText: string;
  // Utility
  isDark: boolean;
}

const LIGHT: ThemeColors = {
  bg:              "#faf8f5",
  card:            "#ffffff",
  surface:         "#f5f5f4",
  inputBg:         "#f5f5f4",
  headerBg:        "#ffffff",
  text:            "#1c1917",
  textSec:         "#78716c",
  textMuted:       "#a8a29e",
  textPlaceholder: "#d1d5db",
  border:          "#f0ede8",
  borderStrong:    "#e7e5e4",
  accent:          "#6366f1",
  accentBg:        "#ede9fe",
  accentText:      "#4f46e5",
  isDark:          false,
};

const DARK: ThemeColors = {
  bg:              "#181512",
  card:            "#232019",
  surface:         "#2e2a25",
  inputBg:         "#2e2a25",
  headerBg:        "#1f1c18",
  text:            "#f0ebe4",
  textSec:         "#9b9690",
  textMuted:       "#6b6560",
  textPlaceholder: "#4d4840",
  border:          "#332d27",
  borderStrong:    "#3d3730",
  accent:          "#818cf8",
  accentBg:        "#2d2a5e",
  accentText:      "#a5b4fc",
  isDark:          true,
};

const STORAGE_KEY = "eb_theme_mode";

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  colors: LIGHT,
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [mode, setModeState] = useState<ThemeMode>("system");

  // Load persisted preference
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "light" || v === "dark" || v === "system") setModeState(v);
    });
  }, []);

  async function setMode(m: ThemeMode) {
    setModeState(m);
    await AsyncStorage.setItem(STORAGE_KEY, m);
  }

  // Resolve effective scheme
  const resolved: "light" | "dark" =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  const colors = resolved === "dark" ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ mode, colors, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
