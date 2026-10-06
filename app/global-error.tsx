"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

/**
 * The last resort: the root layout itself failed.
 *
 * This replaces the whole document, so it renders its own `<html>` and `<body>`
 * and cannot use the app's stylesheet or fonts — hence the literal colours. No
 * imports beyond React and the error SDK, because whatever broke may be the
 * thing that would have loaded them.
 */
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#111a22",
          color: "#eef1f4",
        }}
      >
        <main
          style={{ maxWidth: "28rem", padding: "1.5rem", textAlign: "center" }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h1>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.875rem",
              color: "#a9b3bd",
            }}
          >
            This page didn&apos;t load. Trying again usually fixes it.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              border: 0,
              borderRadius: "9999px",
              background: "#00b67c",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
