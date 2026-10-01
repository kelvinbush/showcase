"use client";

import { ArrowUpRight, Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { motionTokens } from "@/components/arc/lib/motion-tokens";
import { Player } from "@/components/player/player";
import { SmeCover } from "@/components/sme/cover";
import { place } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { SmeCard } from "@/lib/types";
import { toEmbed } from "@/lib/video";
import styles from "./video-stage.module.css";

/**
 * One large screen with a programme beside it, like a small cinema: choose a
 * business on the right and its video plays on the left, with our own
 * controls. The player only loads once something is chosen, so the page stays
 * light until then.
 */
export function VideoStage({ smes }: { smes: SmeCard[] }) {
  const t = useT();
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState(smes[0]?.id);
  const [playing, setPlaying] = useState(false);

  const active = smes.find((sme) => sme.id === activeId) ?? smes[0];
  if (!active) return null;
  const embed = active.videoUrl ? toEmbed(active.videoUrl) : null;
  const where = place(active);

  return (
    <div className={styles.stage}>
      <div className={styles.screen}>
        {playing && embed ? (
          // A new key per business, so the player starts afresh.
          <Player
            key={active.id}
            embed={embed}
            title={t("video.title", { name: active.name })}
          />
        ) : (
          <button
            type="button"
            className={styles.poster}
            onClick={() => setPlaying(true)}
            disabled={!embed}
          >
            <SmeCover
              name={active.name}
              src={active.coverImage ?? embed?.poster ?? null}
              sizes="(max-width: 860px) 100vw, 760px"
              className={styles.cover}
            />
            <span className={styles.shade} aria-hidden="true" />
            <span className={styles.play}>
              <Play size={26} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className={styles.caption}>
              <span className={styles.name}>{active.name}</span>
              {where && <span className={styles.where}>{where}</span>}
            </span>
            <span className={styles.srOnly}>{t("video.play")}</span>
          </button>
        )}
      </div>

      <div className={styles.side}>
        <ul className={styles.list}>
          {smes.map((sme, index) => {
            const selected = sme.id === active.id;
            return (
              <li key={sme.id}>
                <button
                  type="button"
                  className={styles.row}
                  aria-pressed={selected}
                  onClick={() => {
                    setActiveId(sme.id);
                    setPlaying(true);
                  }}
                >
                  {selected && (
                    <motion.span
                      layoutId="video-stage-highlight"
                      className={styles.highlight}
                      transition={
                        reduce ? { duration: 0 } : motionTokens.spring.morph
                      }
                      aria-hidden="true"
                    />
                  )}
                  <span className={styles.index}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.thumb}>
                    <SmeCover
                      name={sme.name}
                      src={sme.coverImage}
                      sizes="96px"
                    />
                  </span>
                  <span className={styles.rowText}>
                    <span className={styles.rowName}>{sme.name}</span>
                    <span className={styles.rowWhere}>
                      {selected && playing
                        ? t("video.nowPlaying")
                        : place(sme) || t("video.watch")}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className={styles.about}>
          {(active.description ?? active.tagline) && (
            <p className={styles.blurb}>
              {active.description ?? active.tagline}
            </p>
          )}
          <Link href={`/sme/${active.id}`} className={styles.link}>
            {t("video.open", { name: active.name })}
            <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
