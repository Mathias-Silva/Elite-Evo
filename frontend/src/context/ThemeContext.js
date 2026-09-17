import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { DARK_COLORS, LIGHT_COLORS } from "../theme";

const THEME_KEY = "theme_mode";
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const db = useSQLiteContext();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadThemePreference() {
      try {
        const row = await db.getFirstAsync(
          "SELECT value FROM app_preferences WHERE key = ?",
          [THEME_KEY],
        );

        if (isMounted && row?.value) {
          setIsDarkMode(row.value !== "light");
        }
      } catch (error) {
        console.error("Erro ao carregar tema:", error);
      } finally {
        if (isMounted) {
          setIsThemeReady(true);
        }
      }
    }

    loadThemePreference();

    return () => {
      isMounted = false;
    };
  }, [db]);

  const setThemeMode = async (nextIsDarkMode) => {
    setIsDarkMode(nextIsDarkMode);

    try {
      await db.runAsync(
        "INSERT OR REPLACE INTO app_preferences (key, value) VALUES (?, ?)",
        [THEME_KEY, nextIsDarkMode ? "dark" : "light"],
      );
    } catch (error) {
      console.error("Erro ao salvar tema:", error);
    }
  };

  const toggleTheme = () => {
    setThemeMode(!isDarkMode);
  };

  const value = useMemo(
    () => ({
      isDarkMode,
      isThemeReady,
      colors: isDarkMode ? DARK_COLORS : LIGHT_COLORS,
      setThemeMode,
      toggleTheme,
    }),
    [isDarkMode, isThemeReady],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }

  return context;
}
