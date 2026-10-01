import type { SmeCard } from "./types";

export function place(sme: Pick<SmeCard, "city" | "country">): string {
  return [sme.city, sme.country].filter(Boolean).join(", ");
}

/** Sector names are typed by hand; show them with a leading capital. */
export function sectorLabel(sector: string): string {
  const clean = sector.trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/** Hosts whose images Next is allowed to resize (see next.config.ts). */
const RESIZABLE_HOSTS = [
  "pub-5b31f562a8844a1fa6c2e66816ca678e.r2.dev",
  "utfs.io",
];

export function isResizable(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const { hostname } = new URL(src);
    return RESIZABLE_HOSTS.includes(hostname) || hostname.endsWith(".ufs.sh");
  } catch {
    return false;
  }
}

/**
 * A logo address that is safe to hand to Arc's Avatar, which renders through
 * next/image and fails on a host that has not been listed. Anything else falls
 * back to the avatar's initials.
 */
export function logoSrc(src: string | null | undefined): string | undefined {
  return src && isResizable(src) ? src : undefined;
}

/** How much a business has to show: used to choose who leads the page. */
export function richness(sme: SmeCard): number {
  return (
    (sme.isFeatured ? 8 : 0) +
    (sme.coverImage ? 4 : 0) +
    (sme.description ? 2 : 0) +
    (sme.hasVideo ? 1 : 0)
  );
}
