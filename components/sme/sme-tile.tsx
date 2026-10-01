"use client";

import { ArrowUpRight, Play } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/arc/avatar/avatar";
import { logoSrc, place, sectorLabel } from "@/lib/format";
import { type Translate, useT } from "@/lib/i18n";
import type { SmeCard } from "@/lib/types";
import { SmeCover } from "./cover";
import styles from "./sme-tile.module.css";

/**
 * - card: photo with the name over it, then a description and labelled facts.
 * - feature: one large photo with everything over it, for the spotlight.
 * - poster: a photo with just the name over it, for dense rows.
 */
export type TileVariant = "card" | "feature" | "poster";

/** Up to three labelled facts; a fact with no data is left out, not padded. */
function facts(sme: SmeCard, t: Translate): { label: string; value: string }[] {
  return [
    sme.yearFounded
      ? { label: t("tile.founded"), value: sme.yearFounded }
      : null,
    sme.employees
      ? {
          label: t("tile.team"),
          value: t("tile.people", { count: sme.employees }),
        }
      : null,
    sme.womenEmployeesPct
      ? { label: t("tile.women"), value: `${sme.womenEmployeesPct}%` }
      : null,
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact));
}

export function SmeTile({
  sme,
  variant = "card",
  priority = false,
}: {
  sme: SmeCard;
  variant?: TileVariant;
  priority?: boolean;
}) {
  const t = useT();
  const where = place(sme);
  const blurb = sme.description ?? sme.tagline;
  const details = facts(sme, t);
  const sectors = sme.sectors.slice(0, 2).map(sectorLabel).join(" · ");

  return (
    <Link
      href={`/sme/${sme.id}`}
      className={styles.tile}
      data-variant={variant}
    >
      <div className={styles.media}>
        <SmeCover
          name={sme.name}
          src={sme.coverImage}
          priority={priority}
          sizes={
            variant === "feature"
              ? "(max-width: 860px) 100vw, 640px"
              : "(max-width: 720px) 100vw, 420px"
          }
          className={styles.cover}
        />
        <div className={styles.shade} aria-hidden="true" />

        {sme.hasVideo && (
          <span className={styles.video}>
            <Play size={12} strokeWidth={2} aria-hidden="true" />
            {t("tile.video")}
          </span>
        )}
        <span className={styles.open} aria-hidden="true">
          <ArrowUpRight size={18} strokeWidth={1.75} />
        </span>

        <div className={styles.over}>
          {variant !== "card" && sectors && (
            <p className={styles.kicker}>{sectors}</p>
          )}
          <h3 className={styles.name}>{sme.name}</h3>
          {where && <p className={styles.where}>{where}</p>}
          {variant === "feature" && blurb && (
            <p className={styles.overBlurb}>{blurb}</p>
          )}
        </div>
      </div>

      {variant === "card" && (
        <div className={styles.body}>
          <div className={styles.byline}>
            <Avatar name={sme.name} src={logoSrc(sme.logo)} size="sm" />
            <span className={styles.sectors}>
              {sectors || t("tile.noSector")}
            </span>
          </div>
          <p className={styles.blurb}>{blurb ?? t("tile.noDescription")}</p>
          {details.length > 0 && (
            <dl className={styles.facts}>
              {details.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </Link>
  );
}
