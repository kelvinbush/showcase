/**
 * Takes the recognisable personal and secret shapes out of free text.
 *
 * An error message or a log line is free text, and free text carries whatever
 * was in the variable: "no user for jane@example.com", "invalid msisdn
 * +254 712 345 678". PostHog is a third party, so these come out before a
 * message is sent there. File names, line numbers, dates and our own record ids
 * are left alone — they are what locates a bug.
 *
 * Imports nothing, so anything can use it.
 */

const SCRUBBERS: Array<[RegExp, string]> = [
  [/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/g, "$1 [token]"],
  [/\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}/g, "[token]"],
  [/\b(?:sk|pk|rk|phc|phx|whsec)_[A-Za-z0-9_]{8,}/g, "[key]"],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]"],
  // Phone numbers written with spaces or dashes, which need the leading plus to
  // be told apart from a date.
  [/\+\d[\d\s-]{7,}\d/g, "[number]"],
  // Any long run of digits: phone, national id, account number, amount.
  [/\d{7,}/g, "[number]"],
];

export function scrub(text: string): string {
  let out = text;
  for (const [pattern, replacement] of SCRUBBERS)
    out = out.replace(pattern, replacement);
  return out;
}
