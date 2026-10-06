/**
 * Browser-side PostHog, for one thing only: knowing when this app breaks.
 *
 * Investors are guests here, so none of the product analytics the other apps
 * use is on — no page views, no click tracking, no session replay — nobody is
 * identified, and nothing is kept in the browser, which is why there is no
 * cookie banner. What is sent is errors: ones nobody caught, ones written to
 * the console, and (from `callApi` in lib/api.ts) API calls that failed.
 *
 * Inert without NEXT_PUBLIC_POSTHOG_KEY, so local development and demo mode
 * never write into the shared project.
 *
 * Events go to `/ingest` on this origin and are rewritten to PostHog in
 * next.config.ts, because ad blockers drop requests to posthog.com.
 */
import posthog from "posthog-js";
import { beforeSend } from "@/lib/error-reporting";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// The ingestion host, e.g. https://us.i.posthog.com. Only the region matters
// here: requests go through /ingest, this just points links at the right UI.
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

if (key) {
  posthog.init(key, {
    api_host: "/ingest",
    ui_host: host.replace(".i.posthog.com", ".posthog.com"),
    defaults: "2026-08-30",
    // Held in memory for the life of the page and nowhere else.
    persistence: "memory",
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_performance: false,
    enable_heatmaps: false,
    disable_session_recording: true,
    disable_surveys: true,
    // Render errors are reported by the error pages; failed API calls by
    // `callApi`. `beforeSend` scrubs messages of emails and numbers.
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: true,
    },
    before_send: beforeSend,
  });
  posthog.register({
    app: "investor-web",
    runtime: "browser",
    // Present when the host exposes its system variables to the build.
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  });
}
