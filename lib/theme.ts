"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "./config";

export type Theme = "light" | "dark";

const listeners = new Set<() => void>();

/** Dark unless the visitor has chosen light: the brand's home is the dark canvas. */
function readTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  document.documentElement.dataset.theme = theme;
  for (const listener of listeners) listener();
}

/** The current theme. The server snapshot is dark, matching first paint. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "dark");
}
