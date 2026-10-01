"use client";

import Image from "next/image";
import { useState } from "react";
import { isResizable } from "@/lib/format";
import styles from "./cover.module.css";

const TINTS = ["green", "pink", "sky", "amber"] as const;

/** The same name always gets the same tint, on the server and in the browser. */
function tintFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return TINTS[hash % TINTS.length];
}

/**
 * A business's photo, filling whatever box it is placed in, or a brand-tinted
 * placeholder built from its initials when it has none.
 */
export function SmeCover({
  name,
  src,
  sizes = "(max-width: 720px) 100vw, 400px",
  priority = false,
  className,
}: {
  name: string;
  src: string | null;
  /** How wide the image is shown, so the browser fetches a fitting size. */
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  // Resizing fetches the original from storage first. Some originals are very
  // large and that fetch can time out; when it does, load the original directly
  // rather than leave a broken picture.
  const [resizeFailed, setResizeFailed] = useState(false);

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={[styles.cover, className].filter(Boolean).join(" ")}
      data-tint={src ? undefined : tintFor(name)}
    >
      {!src ? (
        <span className={styles.initials} aria-hidden="true">
          {initials}
        </span>
      ) : isResizable(src) ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={resizeFailed}
          onError={() => setResizeFailed(true)}
          className={styles.image}
        />
      ) : (
        // biome-ignore lint/performance/noImgElement: a host we have not listed for resizing; shown as is
        <img src={src} alt="" loading="lazy" className={styles.image} />
      )}
    </div>
  );
}
