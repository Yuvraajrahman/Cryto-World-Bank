import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "wbr-theme-pref";

/** @typedef {'system' | 'light' | 'dark'} ThemePreference */
/** @typedef {'light' | 'dark'} ResolvedTheme */

function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function readPreference() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "system";
}

function resolveTheme(pref) {
  return pref === "system" ? getSystemTheme() : pref;
}

function applyDomTheme(resolved) {
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolved === "light" ? "#ffffff" : "#05070c");
}

const ThemeContext = createContext(null);

/**
 * Native theme: system / light / dark.
 * Preference persists; resolved theme follows OS when pref is "system".
 */
export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() =>
    typeof window === "undefined" ? "system" : readPreference(),
  );
  const [resolved, setResolved] = useState(() =>
    typeof window === "undefined" ? "dark" : resolveTheme(readPreference()),
  );

  useEffect(() => {
    const next = resolveTheme(preference);
    setResolved(next);
    applyDomTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* ignore */
    }
  }, [preference]);

  useEffect(() => {
    if (preference !== "system") return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      const next = getSystemTheme();
      setResolved(next);
      applyDomTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((pref) => {
    setPreferenceState(pref);
  }, []);

  const cycle = useCallback(() => {
    setPreferenceState((prev) => {
      if (prev === "system") return "light";
      if (prev === "light") return "dark";
      return "system";
    });
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference, cycle }),
    [preference, resolved, setPreference, cycle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme() must be used inside <ThemeProvider>");
  return ctx;
}
