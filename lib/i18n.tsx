"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  LOCALES,
  type Locale,
  MESSAGES,
  type MessageKey,
  SOURCE_MESSAGES,
} from "./messages";

const KEY = "locale";
const listeners = new Set<() => void>();

function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** The saved language, or the browser's if it is one we support, or English. */
function readLocale(): Locale {
  try {
    const saved = localStorage.getItem(KEY);
    if (isLocale(saved)) return saved;
  } catch {}
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith("fr")) return "fr";
  if (browser.startsWith("pt")) return "pt-MZ";
  if (browser.startsWith("sw")) return "sw";
  return "en";
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function setLocale(locale: Locale) {
  try {
    localStorage.setItem(KEY, locale);
  } catch {}
  for (const listener of listeners) listener();
}

/** The current language. The server always renders English, then the page follows the visitor. */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, readLocale, () => "en");
}

export type Translate = (
  key: MessageKey,
  values?: Record<string, string | number>,
) => string;

/** Returns `t`, which looks a message up in the current language and fills in `{placeholders}`. */
export function useT(): Translate {
  const locale = useLocale();
  return (key, values) => {
    const template = MESSAGES[locale][key] ?? SOURCE_MESSAGES[key];
    if (!values) return template;
    return template.replace(/\{(\w+)\}/g, (match, name) =>
      name in values ? String(values[name]) : match,
    );
  };
}

/** Keeps the page's declared language in step with the chosen one. */
export function LocaleSync() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

/** A translated string as an element, for use inside server components. */
export function T({
  k,
  values,
}: {
  k: MessageKey;
  values?: Record<string, string | number>;
}) {
  const t = useT();
  return <>{t(k, values)}</>;
}
