import { createContext, useContext, type ReactNode } from "react";
export type Theme = "light" | "dark";
const ThemeContext = createContext<{
  theme: Theme;
  setTheme?: (theme: Theme) => void;
}>({ theme: "light" });
export function ThemeProvider({
  theme = "light",
  setTheme,
  children,
}: {
  theme?: Theme;
  setTheme?: (theme: Theme) => void;
  children: ReactNode;
}) {
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme} className="pt-theme">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  return useContext(ThemeContext);
}
