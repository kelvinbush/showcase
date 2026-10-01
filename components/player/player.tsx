"use client";

import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import type { VideoEmbed } from "@/lib/video";
import styles from "./player.module.css";

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

interface State {
  playing: boolean;
  time: number;
  duration: number;
  muted: boolean;
}

const INITIAL: State = { playing: false, time: 0, duration: 0, muted: false };
const YOUTUBE_ORIGIN = "https://www.youtube-nocookie.com";

/**
 * A video player with Melanin Kapital's own controls instead of the browser's
 * or YouTube's: a green play button, a scrub bar, the time, mute and full
 * screen.
 *
 * Uploaded files are driven through the <video> element. YouTube videos play
 * in YouTube's frame with its controls hidden, and are driven by the messages
 * its player accepts (play, pause, seek, mute) and reports (time, duration,
 * state). Vimeo offers no such channel without its SDK, so it keeps its own
 * controls.
 */
export function Player({ embed, title }: { embed: VideoEmbed; title: string }) {
  const t = useT();
  const channel = useId();
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<State>(INITIAL);
  const patch = useCallback(
    (next: Partial<State>) => setState((current) => ({ ...current, ...next })),
    [],
  );

  /** Sends one command to the YouTube frame. */
  const youtube = useCallback((func: string, args: unknown[] = []) => {
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      YOUTUBE_ORIGIN,
    );
  }, []);

  // YouTube reports its state through window messages once we ask to listen.
  useEffect(() => {
    if (embed.provider !== "youtube") return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== YOUTUBE_ORIGIN || typeof event.data !== "string")
        return;
      let data: { event?: string; info?: Record<string, unknown> | null };
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      const info = data.info;
      if (!info || typeof info !== "object") return;
      const next: Partial<State> = {};
      if (typeof info.currentTime === "number") next.time = info.currentTime;
      if (typeof info.duration === "number" && info.duration > 0)
        next.duration = info.duration;
      if (typeof info.muted === "boolean") next.muted = info.muted;
      // 1 is playing, 3 is buffering; everything else is stopped or paused.
      if (typeof info.playerState === "number") {
        next.playing = info.playerState === 1 || info.playerState === 3;
      }
      patch(next);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [embed.provider, patch]);

  const listen = () => {
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: channel, channel: "widget" }),
      YOUTUBE_ORIGIN,
    );
  };

  const toggle = () => {
    if (embed.provider === "youtube") {
      youtube(state.playing ? "pauseVideo" : "playVideo");
      patch({ playing: !state.playing });
    } else if (video.current) {
      if (video.current.paused) video.current.play().catch(() => {});
      else video.current.pause();
    }
  };

  const seek = (time: number) => {
    patch({ time });
    if (embed.provider === "youtube") youtube("seekTo", [time, true]);
    else if (video.current) video.current.currentTime = time;
  };

  const toggleMute = () => {
    if (embed.provider === "youtube") {
      youtube(state.muted ? "unMute" : "mute");
      patch({ muted: !state.muted });
    } else if (video.current) {
      video.current.muted = !video.current.muted;
    }
  };

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else box.current?.requestFullscreen().catch(() => {});
  };

  if (embed.provider === "vimeo") {
    return (
      <div className={styles.player}>
        <iframe
          src={embed.src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className={styles.media}
        />
      </div>
    );
  }

  const progress = state.duration > 0 ? (state.time / state.duration) * 100 : 0;

  return (
    <div
      ref={box}
      className={styles.player}
      data-playing={state.playing || undefined}
    >
      {embed.provider === "youtube" ? (
        <iframe
          ref={frame}
          title={title}
          src={`${YOUTUBE_ORIGIN}/embed/${embed.src}?autoplay=1&controls=0&rel=0&playsinline=1&modestbranding=1&enablejsapi=1`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={listen}
          className={styles.media}
          // Clicks go to our own controls, not to YouTube's overlay.
          tabIndex={-1}
        />
      ) : (
        // biome-ignore lint/a11y/useMediaCaption: captions are not collected for these clips
        <video
          ref={video}
          src={embed.src}
          autoPlay
          playsInline
          className={styles.media}
          onPlay={() => patch({ playing: true })}
          onPause={() => patch({ playing: false })}
          onTimeUpdate={(event) =>
            patch({ time: event.currentTarget.currentTime })
          }
          onLoadedMetadata={(event) =>
            patch({ duration: event.currentTarget.duration })
          }
          onVolumeChange={(event) =>
            patch({ muted: event.currentTarget.muted })
          }
        />
      )}

      {/* The whole picture is a play and pause button. */}
      <button
        type="button"
        className={styles.surface}
        onClick={toggle}
        aria-label={t(state.playing ? "player.pause" : "player.play")}
      />

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.primary}
          onClick={toggle}
          aria-label={t(state.playing ? "player.pause" : "player.play")}
        >
          {state.playing ? (
            <Pause size={18} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Play size={18} strokeWidth={2} aria-hidden="true" />
          )}
        </button>

        <span className={styles.time}>
          {clock(state.time)} / {clock(state.duration)}
        </span>

        <input
          type="range"
          className={styles.scrub}
          min={0}
          max={state.duration || 0}
          step={0.1}
          value={Math.min(state.time, state.duration || 0)}
          onChange={(event) => seek(Number(event.target.value))}
          aria-label={t("player.seek")}
          aria-valuetext={`${clock(state.time)} / ${clock(state.duration)}`}
          style={{ "--progress": `${progress}%` } as React.CSSProperties}
          disabled={state.duration === 0}
        />

        <button
          type="button"
          className={styles.control}
          onClick={toggleMute}
          aria-label={t(state.muted ? "player.unmute" : "player.mute")}
        >
          {state.muted ? (
            <VolumeX size={18} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Volume2 size={18} strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className={styles.control}
          onClick={fullscreen}
          aria-label={t("player.fullscreen")}
        >
          <Maximize size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
