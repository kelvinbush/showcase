"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { sectorLabel } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { SmeCard } from "@/lib/types";
import styles from "./sectors.module.css";

export interface SectorGroup {
  name: string;
  count: number;
}

/** The busiest sectors. */
export function topSectors(smes: SmeCard[], limit: number): SectorGroup[] {
  const groups = new Map<string, SectorGroup>();
  for (const sme of smes) {
    for (const name of sme.sectors) {
      const group = groups.get(name) ?? { name, count: 0 };
      group.count++;
      groups.set(name, group);
    }
  }
  return [...groups.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

// Sector names are free text, so the photo is chosen by the words in them.
// The files are stock photographs; see public/media/sectors/SOURCES.md.
const PHOTOS: [RegExp, string][] = [
  [/aqua|fish|blue econ/i, "fishing"],
  [/food|beverage|restaur|hospital/i, "food"],
  [/agri|farm|crop/i, "agriculture"],
  [/energy|solar|clean ?tech|power/i, "energy"],
  [/waste|circular|recycl|biomass|compost/i, "waste"],
  [/water|sanit|wash/i, "water"],
  [/financ|fintech|bank|insur/i, "finance"],
  [/tech|ict|software|digital/i, "technology"],
  [/manufactur|industr|construct/i, "manufacturing"],
  [/mobil|transport|logist/i, "mobility"],
  [/retail|trade|commerce|fashion|textile|creative/i, "fashion"],
];

function photoFor(sector: string): string {
  const name = PHOTOS.find(([pattern]) => pattern.test(sector))?.[1] ?? "city";
  return `/media/sectors/${name}.jpg`;
}

/**
 * One tall photo tile per sector. The photos are stock pictures of the kind of
 * work, not of any business in the list, so no single company stands in for a
 * whole sector. The tile under the pointer widens while its neighbours give
 * way; choosing one filters the list below.
 */
export function Sectors({
  sectors,
  onSelect,
}: {
  sectors: SectorGroup[];
  onSelect: (sector: string) => void;
}) {
  const t = useT();
  return (
    <ul className={styles.row}>
      {sectors.map((sector) => (
        <li key={sector.name} className={styles.item}>
          <button
            type="button"
            className={styles.tile}
            onClick={() => onSelect(sector.name)}
          >
            <Image
              src={photoFor(sector.name)}
              alt=""
              fill
              sizes="(max-width: 860px) 60vw, 380px"
              className={styles.photo}
            />
            <span className={styles.shade} aria-hidden="true" />
            <span className={styles.open} aria-hidden="true">
              <ArrowUpRight size={16} strokeWidth={1.75} />
            </span>
            <span className={styles.text}>
              <span className={styles.name}>{sectorLabel(sector.name)}</span>
              <span className={styles.count}>
                {sector.count === 1
                  ? t("browse.sectorCountOne")
                  : t("browse.sectorCount", { count: sector.count })}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
