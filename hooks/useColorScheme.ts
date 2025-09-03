import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Appearance, type ColorSchemeName } from "react-native";

const STORAGE_KEY = "@preferred_color_scheme";

type PreferredListener = (value: ColorSchemeName | null) => void;
const _listeners = new Set<PreferredListener>();

export function subscribePreferredColorScheme(fn: PreferredListener) {
  _listeners.add(fn);
  return () => {
    _listeners.delete(fn);
  };
}

/**
 * Returns the current color scheme and a setter to persist user preference.
 * If the stored preference is null, it follows the system Appearance color scheme.
 */
export function useColorScheme(): ColorSchemeName {
  const [scheme, setScheme] = useState<ColorSchemeName | null>(null);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((value: string | null) => {
        if (!mounted) return;
        if (value === "light" || value === "dark") {
          setScheme(value as ColorSchemeName);
        } else {
          setScheme(Appearance.getColorScheme() ?? "light");
        }
      })
      .catch((_err: unknown) => {
        if (!mounted) return;
        setScheme(Appearance.getColorScheme() ?? "light");
      });

    const sub = Appearance.addChangeListener((e) => {
      // only update system scheme when user has no stored preference
      AsyncStorage.getItem(STORAGE_KEY).then((value: string | null) => {
        if (value == null) {
          if (mounted) setScheme(e.colorScheme ?? "light");
        }
      });
    });

    // subscribe to in-memory updates when preference changes
    const unsubPref = subscribePreferredColorScheme((v) => {
      if (!mounted) return;
      if (v === "light" || v === "dark") {
        setScheme(v);
      } else {
        setScheme(Appearance.getColorScheme() ?? "light");
      }
    });

    return () => {
      mounted = false;
      sub.remove();
      unsubPref();
    };
  }, []);

  return scheme ?? Appearance.getColorScheme() ?? "light";
}

export async function setPreferredColorScheme(value: ColorSchemeName | null) {
  try {
    if (value === "light" || value === "dark") {
      await AsyncStorage.setItem(STORAGE_KEY, value);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
    // notify in-memory listeners for immediate updates
    _listeners.forEach((fn) => fn(value));
  } catch {
    // ignore
  }
}
