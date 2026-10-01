"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { Carousel } from "@/components/arc/carousel/carousel";
import { Dialog, DialogContent } from "@/components/arc/dialog/dialog";
import { Player } from "@/components/player/player";
import { SmeCover } from "@/components/sme/cover";
import { useT } from "@/lib/i18n";
import type { SmeVideo } from "@/lib/types";
import { toEmbed, type VideoEmbed } from "@/lib/video";
import styles from "./media.module.css";

interface Playable {
  video: SmeVideo;
  embed: VideoEmbed;
  title: string;
}

/**
 * Videos first, then photos, in one carousel. A video plays in a dialog, with
 * our own controls, so the player only loads (and only contacts YouTube or
 * Vimeo) once it is opened.
 */
export function Media({
  name,
  videos,
  photos,
}: {
  name: string;
  videos: SmeVideo[];
  photos: string[];
}) {
  const t = useT();
  const [playing, setPlaying] = useState<Playable | null>(null);
  const [open, setOpen] = useState(false);

  const playable: Playable[] = videos.flatMap((video, index) => {
    const embed = toEmbed(video.videoUrl);
    return embed
      ? [
          {
            video,
            embed,
            title: video.title ?? t("video.untitled", { number: index + 1 }),
          },
        ]
      : [];
  });

  if (playable.length === 0 && photos.length === 0) return null;

  return (
    <>
      <Carousel
        label={t("profile.media", { name })}
        slideSize="min(86cqw, 460px)"
      >
        {[
          ...playable.map((item) => (
            <button
              key={item.video.id}
              type="button"
              className={styles.slide}
              onClick={() => {
                setPlaying(item);
                setOpen(true);
              }}
            >
              {(item.video.thumbnailUrl ?? item.embed.poster) && (
                // biome-ignore lint/performance/noImgElement: thumbnails come from video hosts chosen in the back office
                <img
                  src={item.video.thumbnailUrl ?? item.embed.poster ?? ""}
                  alt=""
                  loading="lazy"
                  className={styles.image}
                />
              )}
              <span className={styles.play}>
                <Play size={20} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className={styles.caption}>{item.title}</span>
              <span className={styles.srOnly}>{t("video.play")}</span>
            </button>
          )),
          ...photos.map((photo) => (
            <div key={photo} className={styles.slide}>
              <SmeCover name={name} src={photo} sizes="460px" />
            </div>
          )),
        ]}
      </Carousel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={playing?.title ?? ""} className={styles.player}>
          <div className={styles.frame}>
            {open && playing && (
              <Player embed={playing.embed} title={playing.title} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
