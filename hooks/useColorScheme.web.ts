import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
const STORAGE_KEY = "@preferred_color_scheme";

type PreferredListener = (value: "light" | "dark" | null) => void;
const _listeners = new Set<PreferredListener>();

export function subscribePreferredColorScheme(fn: PreferredListener) {
  _listeners.add(fn);
  return () => {
    _listeners.delete(fn);
  };
}

export function useColorScheme() {
  const system = useRNColorScheme();
  const [scheme, setScheme] = useState<string | null>(null);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    if (stored === "light" || stored === "dark") {
      setScheme(stored);
    } else {
      setScheme(system ?? "light");
    }
    const unsub = subscribePreferredColorScheme((v) => {
      if (v === "light" || v === "dark") setScheme(v);
      else setScheme(system ?? "light");
    });
    return () => unsub();
  }, [system]);

  return (scheme ?? system ?? "light") as "light" | "dark";
}
export function setPreferredColorScheme(value: "light" | "dark" | null) {
  try {
    if (value === "light" || value === "dark") {
      window.localStorage.setItem(STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    _listeners.forEach((fn) => fn(value));
  } catch {
    // ignore
  }
}
