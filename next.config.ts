import { withPostHogConfig } from "@posthog/nextjs-config";
import type { NextConfig } from "next";

// PostHog region, from the ingestion host (https://us.i.posthog.com or
// https://eu.i.posthog.com). Scripts and config come from a sibling host.
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const posthogAssetsHost = posthogHost.replace(
  /^https:\/\/(\w+)\.i\./,
  "https://$1-assets.i.",
);

const nextConfig: NextConfig = {
  // Lets a second dev server (the demo preview) run beside the main one
  // without the two sharing a build folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Company photos and logos are stored as full-size originals. Listing
    // their hosts lets Next resize them, so a card loads a small image instead
    // of a multi-megabyte one. Keep this list in step with lib/format.ts.
    remotePatterns: [
      // The legacy archive on Cloudflare R2.
      {
        protocol: "https",
        hostname: "pub-5b31f562a8844a1fa6c2e66816ca678e.r2.dev",
      },
      // UploadThing, where the platform stores new uploads such as logos.
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
    ],
  },
  /**
   * PostHog through this origin, so ad blockers do not quietly drop error
   * reports.
   */
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${posthogAssetsHost}/static/:path*`,
      },
      { source: "/ingest/:path*", destination: `${posthogHost}/:path*` },
    ];
  },
  // PostHog's API paths end in a slash (`/e/`, `/flags/`); Next would
  // otherwise redirect them and drop the request body.
  skipTrailingSlashRedirect: true,
};

/**
 * Wrapped so error stack traces are readable.
 *
 * Without this PostHog still records errors, but every browser stack trace
 * arrives minified. The wrapper uploads source maps at build time, then deletes
 * them so they are not served to the public.
 *
 * Upload needs `POSTHOG_API_KEY` (a personal API key with the "Source map
 * upload" preset, starting `phx_` — not the project key) and
 * `POSTHOG_PROJECT_ID`. Without them the build still succeeds and skips the
 * upload.
 */
const posthogSourceMapsEnabled = Boolean(
  process.env.POSTHOG_API_KEY && process.env.POSTHOG_PROJECT_ID,
);

export default withPostHogConfig(nextConfig, {
  personalApiKey: process.env.POSTHOG_API_KEY ?? "",
  projectId: process.env.POSTHOG_PROJECT_ID,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  sourcemaps: {
    enabled: posthogSourceMapsEnabled,
    // On Vercel these name the release; local builds fall back to git.
    releaseName: process.env.VERCEL_GIT_REPO_SLUG,
    releaseVersion: process.env.VERCEL_GIT_COMMIT_SHA,
    deleteAfterUpload: true,
  },
});
