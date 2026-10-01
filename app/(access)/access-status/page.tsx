"use client";

import Link from "next/link";
import { Alert } from "@/components/arc/alert/alert";
import { Stepper } from "@/components/arc/stepper/stepper";
import { TextReveal } from "@/components/arc/text-reveal/text-reveal";
import { TextShimmer } from "@/components/arc/text-shimmer/text-shimmer";
import { AccessGate } from "@/components/shell/access-gate";
import { useT } from "@/lib/i18n";
import type { MessageKey } from "@/lib/messages";
import type { InvestorMe } from "@/lib/types";
import styles from "./page.module.css";

const SENT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const COPY: Record<
  "pending" | "rejected" | "revoked",
  { title: MessageKey; lede: MessageKey }
> = {
  pending: { title: "status.pendingTitle", lede: "status.pendingBody" },
  rejected: { title: "status.rejectedTitle", lede: "status.rejectedBody" },
  revoked: { title: "status.revokedTitle", lede: "status.revokedBody" },
};

function Status({ me }: { me: InvestorMe }) {
  const t = useT();
  const status = me.status as "pending" | "rejected" | "revoked";
  const copy = COPY[status];
  const sent = me.request ? SENT.format(new Date(me.request.createdAt)) : null;

  return (
    <div className={styles.status}>
      <header className={styles.header}>
        <TextReveal as="h1" className={styles.title} text={t(copy.title)} />
        <p className={styles.lede}>{t(copy.lede)}</p>
      </header>

      {status === "pending" ? (
        <TextShimmer as="p" className={styles.live}>
          {t("status.underReview")}
        </TextShimmer>
      ) : (
        <Alert
          tone="warning"
          title={
            status === "rejected" ? t("status.reason") : t("status.removed")
          }
        >
          {me.request?.rejectionReason ??
            (status === "rejected"
              ? t("status.noReason")
              : t("status.removedBody"))}
        </Alert>
      )}

      <Stepper
        orientation="vertical"
        label={t("status.progress")}
        current={1}
        steps={[
          {
            id: "sent",
            label: t("status.step1"),
            description: sent ? `${me.request?.firmName}, ${sent}` : undefined,
          },
          {
            id: "review",
            label: t("status.step2"),
            description: t("status.step2Body"),
            error:
              status === "rejected"
                ? t("status.notApproved")
                : status === "revoked"
                  ? t("status.removed")
                  : undefined,
          },
          {
            id: "access",
            label: t("status.step3"),
            description: t("status.step3Body"),
          },
        ]}
      />

      {status !== "pending" && (
        <Link href="/request-access" className={styles.again}>
          {t("status.again")}
        </Link>
      )}

      <p className={styles.help}>
        {t("status.questions")}{" "}
        <a href="mailto:investors@melaninkapital.com">
          investors@melaninkapital.com
        </a>
        .
      </p>
    </div>
  );
}

export default function AccessStatusPage() {
  return (
    <AccessGate allow={["pending", "rejected", "revoked"]}>
      {(me) => <Status me={me} />}
    </AccessGate>
  );
}
