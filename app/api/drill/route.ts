import { NextResponse } from "next/server";
import { drillTokenMatches } from "@/lib/drill";
import { reportServerError } from "@/lib/posthog-server";

/**
 * The server half of the drill page: fails on purpose in the two ways a route
 * handler can. Answers 404 without the token, like a route that is not there.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!drillTokenMatches(body.token)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const runId = String(body.runId ?? "").slice(0, 12) || "manual";
  const fail = (scenario: string) => {
    const error = new Error(
      `Drill ${runId}: ${scenario} — a deliberate failure, not a real one.`,
    );
    // A name of its own, so each run is a new issue and the alert for a new
    // issue fires every time.
    error.name = `Drill_${scenario}_${runId}`;
    return error;
  };

  switch (body.scenario) {
    case "check":
      return NextResponse.json({ ok: true });
    case "throw":
      // Not caught here: Next catches it and hands it to onRequestError.
      throw fail("server_throw");
    case "caught":
      await reportServerError(fail("server_caught"), {
        route: "/api/drill",
        message: "Drill: caught in a route handler:",
        request,
      });
      return NextResponse.json({ error: "drill" }, { status: 500 });
    default:
      return NextResponse.json({ error: "Unknown scenario" }, { status: 400 });
  }
}
