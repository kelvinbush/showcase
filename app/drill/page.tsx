import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DrillPanel } from "@/components/drill/drill-panel";
import { drillConfigured } from "@/lib/drill";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Drill",
  robots: { index: false, follow: false },
};

/**
 * A page of buttons that each fail on purpose, for proving in production that
 * errors in this app reach PostHog and the alert channel. Not linked from
 * anywhere, and not there at all unless DRILL_TOKEN is set — see lib/drill.ts.
 */
export default function DrillPage() {
  if (!drillConfigured()) notFound();
  return <DrillPanel />;
}
