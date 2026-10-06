import type { Instrumentation } from "next";

/** Next's server entry point. Nothing to set up; the hook below is the point. */
export function register() {}

/**
 * Every error Next catches on the server — while rendering a page, in a route
 * handler, in a server action, in the proxy.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  // posthog-node needs Node's APIs. The proxy runs on Node in this version of
  // Next, so in practice this is every request.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { reportRequestError } = await import("./lib/posthog-server");
    await reportRequestError(error, request, context);
  }
};
