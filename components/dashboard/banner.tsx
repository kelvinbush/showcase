"use client";

import { SlotText } from "@/components/arc/slot-text/slot-text";
import { SmeCover } from "@/components/sme/cover";
import { richness } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Showcase } from "@/lib/types";
import styles from "./banner.module.css";

/**
 * A short banner in the website's language: the headline on the left, and on
 * the right the outline of Africa as a window onto one of the businesses,
 * ringed by the dashed "reach" circles. It stays short so the businesses
 * themselves are on screen without scrolling.
 */
export function Banner({
  firstName,
  showcase,
}: {
  firstName: string | null;
  showcase: Showcase | undefined;
}) {
  const t = useT();
  const stats = showcase
    ? [
        { value: showcase.stats.smes, label: t("banner.businesses") },
        { value: showcase.stats.countries, label: t("banner.countries") },
        { value: showcase.stats.jobsSupported, label: t("banner.jobs") },
      ]
    : [];
  // The window looks onto the same business that leads the spotlight below.
  const pictured = showcase
    ? [...showcase.smes].sort((a, b) => richness(b) - richness(a))[0]
    : undefined;

  return (
    <section className={styles.banner} aria-labelledby="banner-title" id="top">
      <div className={styles.copy}>
        <h1 id="banner-title" className={styles.title}>
          {t("banner.title")} <em>{t("banner.titleAccent")}</em>
        </h1>
        <p className={styles.lede}>
          {firstName ? `${t("banner.welcome", { name: firstName })} ` : ""}
          {t("banner.lede")}
        </p>
        <dl className={styles.stats} aria-busy={!showcase}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt>{stat.label}</dt>
              <dd>
                <SlotText value={stat.value} spins={0} duration={0.7} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={styles.art} aria-hidden="true">
        <svg viewBox="0 0 400 400" className={styles.rings} aria-hidden="true">
          <circle
            cx="200"
            cy="200"
            r="92"
            stroke="var(--brand-green)"
            strokeOpacity="0.5"
            strokeDasharray="2 9"
          />
          <circle
            cx="200"
            cy="200"
            r="138"
            stroke="var(--brand-pink)"
            strokeOpacity="0.42"
            strokeDasharray="2 12"
          />
          <circle
            cx="200"
            cy="200"
            r="186"
            stroke="var(--brand-sky)"
            strokeOpacity="0.32"
            strokeDasharray="2 16"
          />
        </svg>
        <div className={styles.africa}>
          <SmeCover
            name={pictured?.name ?? "Melanin Kapital"}
            src={pictured?.coverImage ?? "/media/meeting.jpg"}
            sizes="360px"
            priority
          />
        </div>
      </div>
    </section>
  );
}
