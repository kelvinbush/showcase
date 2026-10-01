/**
 * Demo mode serves fixture data and skips Clerk, so the interface can be
 * reviewed without a backend, a database or Clerk keys. It is off unless
 * NEXT_PUBLIC_DEMO_MODE is exactly "1", and must never be set in production.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

/**
 * Temporary demo switch: with NEXT_PUBLIC_OPEN_ACCESS=1 the dashboard opens
 * without signing in, reading real data from the backend (which must have
 * INVESTOR_OPEN_ACCESS=true). Unlike demo mode, nothing here is sample data.
 */
export const OPEN_ACCESS = process.env.NEXT_PUBLIC_OPEN_ACCESS === "1";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
  /\/$/,
  "",
);

export const THEME_KEY = "theme";

/**
 * Runs before paint (see app/layout.tsx) so the page never flashes the wrong
 * theme. Dark is the default; light only when the visitor has chosen it.
 */
export const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem("${THEME_KEY}")==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`;
