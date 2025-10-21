// src/contexts/ThemeContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { theme, darkTheme } from "@/theme/theme";

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useThemeContext must be used within CustomThemeProvider");
  return context;
};

interface Props {
  children: ReactNode;
}

const THEME_STORAGE_KEY = "app-theme-mode";

export function CustomThemeProvider({ children }: Props) {
  // Initialize from stored preference or default to false
  const [darkMode, setDarkMode] = useState(() => {
    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      return stored === "dark";
    }
    return false;
  });

  // Persist theme preference whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        darkMode ? "dark" : "light"
      );
    }
  }, [darkMode]);

  const selectedTheme = useMemo(
    () => (darkMode ? darkTheme : theme),
    [darkMode]
  );

  return (
    <MuiThemeProvider theme={selectedTheme}>
      <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
        {children}
      </ThemeContext.Provider>
    </MuiThemeProvider>
  );
}