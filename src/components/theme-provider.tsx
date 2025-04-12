// src/components/theme-provider.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  ThemeProviderContext,
  type Theme,
  type AppliedTheme,
  type ThemeProviderState,
} from "./theme-context"; // Adjust path as needed

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    } catch (e) {
      console.error("Error reading localStorage:", e);
      return defaultTheme;
    }
  });

  const [appliedTheme, setAppliedTheme] = useState<AppliedTheme>(() => {
    const initialTheme =
      (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    if (initialTheme === "system") {
      return typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return initialTheme;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (newAppliedTheme: AppliedTheme) => {
      root.classList.remove("light", "dark");
      root.classList.add(newAppliedTheme);
      setAppliedTheme(newAppliedTheme);
    };

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const systemTheme = e.matches ? "dark" : "light";
        applyTheme(systemTheme);
      }
    };

    if (theme === "system") {
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      applyTheme(systemTheme);
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else {
      applyTheme(theme);
    }

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (e) {
        console.error("Error writing to localStorage:", e);
      }
      setThemeState(newTheme);
    },
    [storageKey]
  );

  const value: ThemeProviderState = {
    theme,
    appliedTheme,
    setTheme,
  };
  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
