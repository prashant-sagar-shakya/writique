import { createContext, useContext } from "react";

export type Theme = "dark" | "light" | "system";
export type AppliedTheme = "dark" | "light";

export type ThemeProviderState = {
  theme: Theme;
  appliedTheme: AppliedTheme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  appliedTheme: "light",
  setTheme: () => null,
};

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
