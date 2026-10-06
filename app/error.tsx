"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

/**
 * What a visitor sees when a page throws.
 *
 * There was no boundary anywhere in this app, so a render error showed Next's
 * default screen and told nobody. An error caught here never reaches the window
 * listeners PostHog's own capture relies on, so it is reported by hand.
 *
 * In English only: it sits above the language provider, and whatever broke may
 * be the thing that would have supplied the translation.
 */
export default function PageError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    if (posthog.__loaded) posthog.captureException(error);
  }, [error]);

  return (
    <main
      style={{
        display: "grid",
        minHeight: "70dvh",
        placeContent: "center",
        justifyItems: "center",
        gap: "var(--space-4)",
        padding: "var(--space-6)",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-2xl)",
          fontWeight: 500,
          color: "var(--foreground)",
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          margin: 0,
          maxWidth: "28rem",
          fontSize: "var(--text-sm)",
          color: "var(--text-secondary)",
        }}
      >
        This page didn&apos;t load. Trying again usually fixes it.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        style={{
          marginTop: "var(--space-2)",
          padding: "0.75rem 1.5rem",
          border: 0,
          borderRadius: "var(--radius-pill)",
          background: "var(--brand-green)",
          color: "var(--on-brand)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </main>
  );
}
