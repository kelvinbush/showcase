import { PostHog } from "posthog-node";
import { scrub } from "@/lib/scrub";

/**
 * PostHog for code that runs on the server: pages rendered there, route
 * handlers, server actions and the proxy.
 *
 * The browser SDK cannot see any of it. Thrown errors arrive through
 * `onRequestError` in instrumentation.ts; a route handler that catches its own
 * error and answers 500 has to say so itself, with `reportServerError`.
 *
 * Inert without NEXT_PUBLIC_POSTHOG_KEY, like the browser side.
 */

let client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  client ??= new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    // A serverless function can be frozen the moment it responds, so nothing
    // is left in a queue: each event is sent as it is captured.
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
}

/** Who to file a server error under when no person is known. */
const SERVICE_DISTINCT_ID = "investor-web-server";

/**
 * The visitor's PostHog id, from the cookie the browser SDK sets once they have
 * accepted cookies. After sign-in that id is their Clerk id.
 */
export function distinctIdFromCookie(
  cookie: string | string[] | null | undefined,
): string | undefined {
  const header = Array.isArray(cookie) ? cookie.join("; ") : cookie;
  const match = header?.match(/ph_phc_[^=;]*_posthog=([^;]+)/);
  if (!match) return undefined;
  try {
    const id = JSON.parse(decodeURIComponent(match[1])).distinct_id;
    return typeof id === "string" ? id : undefined;
  } catch {
    return undefined;
  }
}

function toSafeError(value: unknown): Error {
  if (value instanceof Error) {
    const safe = new Error(scrub(value.message));
    safe.name = value.name;
    if (value.stack) safe.stack = scrub(value.stack);
    return safe;
  }
  const safe = new Error(
    scrub(typeof value === "string" ? value : String(value)),
  );
  safe.name = "NonErrorThrown";
  return safe;
}

async function send(
  error: unknown,
  distinctId: string | undefined,
  properties: Record<string, unknown>,
): Promise<void> {
  const posthog = getClient();
  if (!posthog) return;
  try {
    await posthog.captureExceptionImmediate(
      toSafeError(error),
      distinctId ?? SERVICE_DISTINCT_ID,
      {
        ...properties,
        app: "investor-web",
        runtime: "next-server",
        environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
        release: process.env.VERCEL_GIT_COMMIT_SHA,
        ...(distinctId ? {} : { $process_person_profile: false }),
      },
    );
  } catch {
    // Reporting a failure must never become one.
  }
}

/** For `onRequestError`: an error Next caught while serving a request. */
export async function reportRequestError(
  error: unknown,
  request: {
    path: string;
    method: string;
    headers: Record<string, string | string[] | undefined>;
  },
  context: { routePath: string; routeType: string },
): Promise<void> {
  await send(error, distinctIdFromCookie(request.headers.cookie), {
    source: "request",
    method: request.method,
    // The route file, e.g. /(app)/sme/[id] — not the URL, which
    // has ids and query strings in it.
    route: context.routePath,
    route_type: context.routeType,
    digest: (error as { digest?: string } | null)?.digest,
  });
}

/**
 * For a route handler that catches its own error and answers 500.
 *
 * Keeps the `console.error` the handlers already had — that is what shows up in
 * the host's function logs — and reports the error as well.
 */
export async function reportServerError(
  error: unknown,
  context: { route: string; message: string; request?: Request },
): Promise<void> {
  console.error(context.message, error);
  await send(
    error,
    distinctIdFromCookie(context.request?.headers.get("cookie")),
    {
      source: "route_handler",
      route: context.route,
      log_message: context.message,
    },
  );
}
