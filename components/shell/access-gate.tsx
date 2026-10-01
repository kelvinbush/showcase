"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Alert } from "@/components/arc/alert/alert";
import { Button } from "@/components/arc/button/button";
import { TextShimmer } from "@/components/arc/text-shimmer/text-shimmer";
import { useInvestorMe } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import type { InvestorMe } from "@/lib/types";
import styles from "./page.module.css";

/** Where each access state belongs. */
function homeFor(me: InvestorMe): string {
  if (me.status === "approved") return "/";
  return me.status === "none" ? "/request-access" : "/access-status";
}

/**
 * Renders its children only when the signed-in user's access state is one of
 * `allow`; otherwise sends them to the screen for the state they are in. This
 * is a convenience for navigation: the API enforces access on every request.
 */
export function AccessGate({
  allow,
  children,
}: {
  allow: InvestorMe["status"][];
  children: (me: InvestorMe) => React.ReactNode;
}) {
  const t = useT();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useSession();
  const { data: me, isError, refetch, isFetching } = useInvestorMe();

  const allowed = me ? allow.includes(me.status) : false;
  const signedOut = isLoaded && !isSignedIn;

  useEffect(() => {
    if (signedOut) router.replace("/welcome");
    else if (me && !allowed) router.replace(homeFor(me));
  }, [signedOut, me, allowed, router]);

  if (isError) {
    return (
      <div className={styles.center}>
        <Alert tone="danger" title={t("gate.errorTitle")}>
          {t("gate.errorBody")}
          <div style={{ marginTop: "var(--space-3)" }}>
            <Button
              variant="secondary"
              size="sm"
              loading={isFetching}
              onClick={() => refetch()}
            >
              {t("common.tryAgain")}
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!me || !allowed) {
    return (
      <div className={styles.center} aria-busy="true">
        <TextShimmer className={styles.checking}>
          {t("gate.checking")}
        </TextShimmer>
      </div>
    );
  }

  return <>{children(me)}</>;
}
