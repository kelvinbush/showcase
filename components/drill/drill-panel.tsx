"use client";

import { useState } from "react";
import { ApiError, callApi } from "@/lib/api";
import styles from "./drill-panel.module.css";

/**
 * Buttons that each break this app in one specific way, so the reporting and
 * the alerts can be seen to work with the real key and the real Slack channel.
 *
 * Nothing here runs until the drill token has been checked by the server. Each
 * run makes an error with a name of its own, so it lands as a new issue and
 * the alert for a new issue fires every time.
 */

type Run = (context: { token: string; runId: string }) => Promise<string>;

interface Scenario {
  id: string;
  label: string;
  expect: string;
  run: Run;
  /** Leaves this page, so it is kept out of "Run all". */
  manualOnly?: boolean;
}

function drillError(scenario: string, runId: string) {
  const error = new Error(
    `Drill ${runId}: ${scenario} — a deliberate failure, not a real one.`,
  );
  error.name = `Drill_${scenario}_${runId}`;
  return error;
}

async function postLocal(body: Record<string, unknown>) {
  const response = await fetch("/api/drill", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.status;
}

/** Asks the API to fail, through the same function every real request uses. */
const viaApi =
  (scenario: string): Run =>
  async ({ token }) => {
    try {
      await callApi(
        "/drill",
        { method: "POST", body: JSON.stringify({ token, scenario }) },
        null,
      );
      return "the API answered without failing";
    } catch (error) {
      return error instanceof ApiError
        ? `the API answered ${error.status}`
        : "the API did not answer";
    }
  };

const SCENARIOS: Scenario[] = [
  {
    id: "browser_uncaught",
    label: "Browser: an error nobody catches",
    expect: "A new issue, app investor-web, runtime browser.",
    run: async ({ runId }) => {
      setTimeout(() => {
        throw drillError("browser_uncaught", runId);
      }, 0);
      return "thrown";
    },
  },
  {
    id: "browser_rejection",
    label: "Browser: a rejected promise nobody handles",
    expect: "A new issue, runtime browser.",
    run: async ({ runId }) => {
      void Promise.reject(drillError("browser_rejection", runId));
      return "rejected";
    },
  },
  {
    id: "browser_console",
    label: "Browser: an error caught and written to the console",
    expect: "A new issue, runtime browser.",
    run: async ({ runId }) => {
      console.error("Drill:", drillError("browser_console", runId));
      return "logged";
    },
  },
  {
    id: "api_failure",
    label: "API call fails with a 500",
    expect:
      "Two new issues: one from this app (ApiFailure, with a request id) and one from the backend carrying the same request id.",
    run: viaApi("throw"),
  },
  {
    id: "api_rejected",
    label: "API call is refused with a 400",
    expect: "NOTHING in error tracking. A 4xx is an answer, not a fault.",
    run: viaApi("rejected"),
  },
  {
    id: "server_throw",
    label: "Server: a route handler throws",
    expect: "A new issue, runtime next-server, source request.",
    run: async ({ token, runId }) =>
      `this app's server answered ${await postLocal({ token, runId, scenario: "throw" })}`,
  },
  {
    id: "server_caught",
    label: "Server: a route handler catches and answers 500",
    expect: "A new issue, runtime next-server, source route_handler.",
    run: async ({ token, runId }) =>
      `this app's server answered ${await postLocal({ token, runId, scenario: "caught" })}`,
  },
  {
    id: "render_crash",
    label: "A screen crashes while rendering",
    expect:
      'A new issue, and this page is replaced by the "Something went wrong" screen. Use its retry button to come back.',
    manualOnly: true,
    run: async () => "crashing",
  },
];

const newRunId = () => crypto.randomUUID().slice(0, 6);

export function DrillPanel() {
  const [token, setToken] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [refused, setRefused] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});
  const [crash, setCrash] = useState<Error | null>(null);

  // Thrown from render on purpose: this is the one failure only React can have.
  if (crash) throw crash;

  const unlock = async () => {
    setChecking(true);
    setRefused(false);
    const ok = (await postLocal({ token, scenario: "check" })) === 200;
    setUnlocked(ok);
    setRefused(!ok);
    setChecking(false);
  };

  const run = async (scenario: Scenario) => {
    const runId = newRunId();
    if (scenario.id === "render_crash") {
      setCrash(drillError("render_crash", runId));
      return;
    }
    setResults((r) => ({ ...r, [scenario.id]: "running…" }));
    const note = await scenario.run({ token, runId }).catch(() => "failed");
    setResults((r) => ({ ...r, [scenario.id]: `${note} · run ${runId}` }));
  };

  const runAll = async () => {
    for (const scenario of SCENARIOS) {
      if (!scenario.manualOnly) await run(scenario);
    }
  };

  return (
    <main className={styles.panel}>
      <h1 className={styles.title}>Error reporting drill</h1>
      <p className={styles.intro}>
        Each button breaks this app on purpose in one way. Watch PostHog error
        tracking and the Slack alert channel for what should follow. Search for
        the run id to find a particular one.
      </p>

      {!unlocked ? (
        <div className={styles.unlock}>
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Drill token"
            autoComplete="off"
            className={styles.token}
          />
          <button
            type="button"
            onClick={unlock}
            disabled={!token || checking}
            className={styles.primary}
          >
            {checking ? "Checking…" : "Unlock"}
          </button>
        </div>
      ) : (
        <>
          <button type="button" onClick={runAll} className={styles.primary}>
            Run all (except the screen crash)
          </button>
          <ul className={styles.list}>
            {SCENARIOS.map((scenario) => (
              <li key={scenario.id} className={styles.item}>
                <div>
                  <p className={styles.label}>{scenario.label}</p>
                  <p className={styles.expect}>Expect: {scenario.expect}</p>
                  {results[scenario.id] ? (
                    <p className={styles.result}>{results[scenario.id]}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => run(scenario)}
                  className={styles.run}
                >
                  Run
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {refused ? (
        <p className={styles.refused}>That token was not accepted.</p>
      ) : null}
    </main>
  );
}
