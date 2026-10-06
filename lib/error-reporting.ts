import type { BeforeSendFn } from "@posthog/types";
import posthog from "posthog-js";
import { scrub } from "@/lib/scrub";

/**
 * How errors in the browser reach PostHog, beyond what the SDK catches on its
 * own.
 *
 * The SDK hears about errors nobody caught and anything written with
 * `console.error`. What it cannot know is that a request failed when the page
 * handled it politely — showed a message and carried on — which is how every
 * failed API call here ends. `reportApiFailure` is called from the one function
 * every API request passes through (`callApi` in lib/api.ts).
 */

/** A request id the backend adopts, so an error here leads to its log lines. */
export function newRequestId(): string {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  // The prefix says which app asked: the SME portal's are `sme_`, admin's `adm_`.
  return `inv_${uuid}`;
}

/** `/investor/showcase/cm1a2b3c…/interest` → `/investor/showcase/:id/interest`. */
export function endpointTemplate(path: string): string {
  return path
    .split(/[?#]/)[0]
    .split("/")
    .map((segment) =>
      // A uuid, a number, or one of our own ids: long, and with a digit in it.
      /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(segment) ||
      /^\d+$/.test(segment) ||
      (segment.length >= 16 && /\d/.test(segment))
        ? ":id"
        : segment,
    )
    .join("/");
}

/**
 * Reports an API call that failed through no fault of the visitor's: the server
 * answered 5xx, or never answered.
 *
 * A 4xx is not reported. It is the API saying no — not approved yet, not found —
 * and the page already tells the visitor so.
 */
export function reportApiFailure(input: {
  method: string;
  path: string;
  /** Absent when no response came back at all. */
  status?: number;
  requestId: string | null;
}) {
  if (!posthog.__loaded) return;
  if (input.status !== undefined && input.status < 500) return;
  // Offline is the visitor's connection, not our fault, and the report could
  // not be sent anyway.
  if (
    input.status === undefined &&
    typeof navigator !== "undefined" &&
    navigator.onLine === false
  ) {
    return;
  }

  const endpoint = endpointTemplate(input.path);
  const outcome = input.status ?? "network";
  const error = new Error(
    input.status
      ? `${input.method} ${endpoint} responded ${input.status}`
      : `${input.method} ${endpoint} got no answer`,
  );
  error.name = "ApiFailure";
  posthog.captureException(error, {
    source: "api_call",
    failure: input.status ? "server_error" : "network",
    method: input.method,
    endpoint,
    status_code: input.status ?? 0,
    // The same id is on every backend log line for this request.
    request_id: input.requestId,
    // One issue per endpoint and kind of failure.
    $exception_fingerprint: `api:${input.method} ${endpoint} ${outcome}`,
  });
}

// A request that got no answer throws the browser's own error, which then
// travels on to whoever awaits the request. It has been reported here already,
// so it is remembered and not reported a second time further along.
const alreadyReported = new WeakSet<object>();

export function markReported(error: unknown) {
  if (error && typeof error === "object") alreadyReported.add(error);
}

/** Reports anything else worth knowing about that the code caught itself. */
export function reportError(
  error: unknown,
  properties: Record<string, unknown> = {},
) {
  if (!posthog.__loaded) return;
  if (error && typeof error === "object" && alreadyReported.has(error)) return;
  posthog.captureException(error, properties);
}

interface ExceptionEntry {
  type?: string;
  value?: string;
}

/**
 * Runs on every event before it leaves the browser. Two jobs, both only for
 * exceptions:
 *
 * - Drop an `ApiError` the SDK picked up by itself. That is the API saying no;
 *   the ones that are faults have already been reported by `reportApiFailure`,
 *   with the endpoint and the request id.
 * - Scrub the message. It is free text and can carry an email or a number.
 */
export const beforeSend: BeforeSendFn = (event) => {
  if (!event || event.event !== "$exception") return event;

  const list = event.properties.$exception_list as ExceptionEntry[] | undefined;
  if (Array.isArray(list)) {
    if (list.some((entry) => entry.type === "ApiError")) return null;
    for (const entry of list) {
      if (typeof entry.value === "string") entry.value = scrub(entry.value);
    }
  }
  return event;
};
