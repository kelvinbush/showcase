import { timingSafeEqual } from "node:crypto";

/**
 * The drill is a page of buttons that each fail on purpose, for proving in
 * production that error reporting and its alerts work. It exists only while
 * DRILL_TOKEN is set, and does nothing for anyone who cannot supply it.
 */

/** Long enough that it was generated, not typed. */
const MIN_TOKEN_LENGTH = 24;

export function drillConfigured(): boolean {
  return (process.env.DRILL_TOKEN ?? "").length >= MIN_TOKEN_LENGTH;
}

export function drillTokenMatches(given: unknown): boolean {
  const expected = process.env.DRILL_TOKEN;
  if (!drillConfigured() || !expected || typeof given !== "string")
    return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
