"use client";

import { SignUp } from "@clerk/nextjs";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/arc/alert/alert";
import { Button } from "@/components/arc/button/button";
import { ChipGroup } from "@/components/arc/chip-group/chip-group";
import { Input } from "@/components/arc/input/input";
import { motionTokens } from "@/components/arc/lib/motion-tokens";
import { Select } from "@/components/arc/select/select";
import { TextReveal } from "@/components/arc/text-reveal/text-reveal";
import { TextShimmer } from "@/components/arc/text-shimmer/text-shimmer";
import { Textarea } from "@/components/arc/textarea/textarea";
import { AccessGate } from "@/components/shell/access-gate";
import shell from "@/components/shell/page.module.css";
import { useSubmitAccessRequest } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { INVESTOR_TYPES, SECTORS, TICKET_SIZES } from "@/lib/options";
import { useSession } from "@/lib/session";
import type { AccessRequest, AccessRequestInput } from "@/lib/types";
import styles from "./page.module.css";

/**
 * A visitor fills the form before they have an account. The answers wait in
 * sessionStorage while Clerk creates the account (which can leave the page for
 * email or social sign-up) and are sent as soon as they come back signed in.
 */
const DRAFT_KEY = "mk-access-request-draft";

function readDraft(): AccessRequestInput | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as AccessRequestInput) : null;
  } catch {
    return null;
  }
}

function saveDraft(input: AccessRequestInput | null) {
  try {
    if (input) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(input));
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch {}
}

// The form asks only for what the team needs to decide. The API also accepts a
// role, country and website; they are kept when present but no longer asked for.
interface Form {
  firmName: string;
  investorType: string;
  ticketSize: string;
  sectors: string[];
  note: string;
}

type Source = Partial<AccessRequestInput> | null;

function initial(source: Source): Form {
  return {
    firmName: source?.firmName ?? "",
    investorType: source?.investorType ?? "",
    ticketSize: source?.ticketSize ?? "",
    sectors: source?.sectorsOfInterest ?? [],
    note: source?.note ?? "",
  };
}

function RequestForm({
  previous,
  signedIn,
}: {
  previous: AccessRequest | null;
  signedIn: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const reduce = useReducedMotion();
  const submit = useSubmitAccessRequest();
  const [source] = useState<Source>(() => previous ?? readDraft());
  const [form, setForm] = useState<Form>(() => initial(source));
  const [touched, setTouched] = useState(false);
  // Signed-out visitors create their account once the form is filled in.
  const [creatingAccount, setCreatingAccount] = useState(false);
  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const errors = {
    firmName: form.firmName.trim() ? undefined : t("request.firmError"),
    investorType: form.investorType ? undefined : t("request.typeError"),
  };
  const valid = !errors.firmName && !errors.investorType;

  const onSubmit = () => {
    setTouched(true);
    if (!valid) return;

    const input: AccessRequestInput = {
      firmName: form.firmName.trim(),
      investorType: form.investorType,
      jobTitle: source?.jobTitle ?? null,
      country: source?.country ?? null,
      website: source?.website ?? null,
      ticketSize: form.ticketSize || null,
      sectorsOfInterest: form.sectors,
      note: form.note.trim() || null,
    };

    if (signedIn) {
      submit.mutate(input, {
        onSuccess: () => router.replace("/access-status"),
      });
    } else {
      saveDraft(input);
      setCreatingAccount(true);
      window.scrollTo({ top: 0 });
    }
  };

  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
      };

  return (
    <div className={styles.request}>
      <header className={styles.header}>
        <TextReveal
          as="h1"
          className={styles.title}
          text={
            creatingAccount
              ? t("request.titleAccount")
              : previous
                ? t("request.titleUpdate")
                : t("request.title")
          }
        />
        <p className={styles.lede}>
          {creatingAccount ? t("request.ledeAccount") : t("request.lede")}
        </p>
      </header>

      {previous?.status === "rejected" && previous.rejectionReason && (
        <Alert tone="warning" title={t("request.rejected")}>
          {previous.rejectionReason}
        </Alert>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={creatingAccount ? "account" : "form"}
          {...swap}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  duration: motionTokens.duration.standard,
                  ease: [...motionTokens.ease.standard],
                }
          }
        >
          {creatingAccount ? (
            <div className={styles.account}>
              <SignUp
                routing="hash"
                signInUrl="/sign-in"
                forceRedirectUrl="/request-access"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreatingAccount(false)}
              >
                {t("request.back")}
              </Button>
            </div>
          ) : (
            <form
              className={styles.form}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
              }}
            >
              <Input
                label={t("request.firm")}
                autoComplete="organization"
                value={form.firmName}
                onChange={(event) => set("firmName", event.target.value)}
                error={touched ? errors.firmName : undefined}
                maxLength={200}
              />
              <div className={styles.pair}>
                <Select
                  label={t("request.type")}
                  placeholder={t("request.typePlaceholder")}
                  value={form.investorType || undefined}
                  onValueChange={(value) => set("investorType", value)}
                  options={INVESTOR_TYPES}
                  description={touched ? errors.investorType : undefined}
                />
                <Select
                  label={t("request.ticket")}
                  placeholder={t("request.optional")}
                  value={form.ticketSize || undefined}
                  onValueChange={(value) => set("ticketSize", value)}
                  options={TICKET_SIZES.map(({ value, label }) => ({
                    value,
                    label,
                  }))}
                />
              </div>
              <fieldset className={styles.fieldset}>
                <legend>{t("request.sectors")}</legend>
                <ChipGroup
                  label={t("request.sectors")}
                  value={form.sectors}
                  onValueChange={(value) => set("sectors", value)}
                  maxVisible={8}
                  options={SECTORS.map((sector) => ({
                    value: sector,
                    label: sector,
                  }))}
                />
              </fieldset>
              <Textarea
                label={t("request.note")}
                rows={3}
                maxLength={2000}
                value={form.note}
                onChange={(event) => set("note", event.target.value)}
                placeholder={t("request.notePlaceholder")}
              />

              {submit.isError && (
                <Alert tone="danger" title={t("request.failedTitle")}>
                  {t("request.failedBody")}
                </Alert>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submit.isPending}
                className={styles.submit}
              >
                {signedIn ? t("request.send") : t("request.continue")}
              </Button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Sends the answers a visitor gave before creating their account. */
function SendDraft({ draft }: { draft: AccessRequestInput }) {
  const t = useT();
  const router = useRouter();
  const submit = useSubmitAccessRequest();
  const started = useRef(false);
  const { mutate } = submit;

  useEffect(() => {
    // Strict mode runs effects twice in development; the request must go once.
    if (started.current) return;
    started.current = true;
    mutate(draft, {
      onSuccess: () => {
        saveDraft(null);
        router.replace("/access-status");
      },
    });
  }, [draft, mutate, router]);

  if (submit.isError) {
    return (
      <Alert tone="danger" title={t("request.failedTitle")}>
        {t("request.failedSaved")}
        <div style={{ marginTop: "var(--space-3)" }}>
          <Button
            variant="secondary"
            size="sm"
            loading={submit.isPending}
            onClick={() =>
              mutate(draft, {
                onSuccess: () => {
                  saveDraft(null);
                  router.replace("/access-status");
                },
              })
            }
          >
            {t("request.resend")}
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className={shell.center} aria-busy="true">
      <TextShimmer className={shell.checking}>
        {t("request.sending")}
      </TextShimmer>
    </div>
  );
}

function SignedInRequest({ previous }: { previous: AccessRequest | null }) {
  // Read once: this only renders in the browser, after the access check.
  const [draft] = useState(readDraft);
  if (draft && !previous) return <SendDraft draft={draft} />;
  return <RequestForm previous={previous} signedIn />;
}

export default function RequestAccessPage() {
  const t = useT();
  const { isLoaded, isSignedIn } = useSession();

  if (!isLoaded) {
    return (
      <div className={shell.center} aria-busy="true">
        <TextShimmer className={shell.checking}>
          {t("common.loading")}
        </TextShimmer>
      </div>
    );
  }
  if (!isSignedIn) return <RequestForm previous={null} signedIn={false} />;

  return (
    <AccessGate allow={["none", "rejected", "revoked"]}>
      {(me) => <SignedInRequest previous={me.request} />}
    </AccessGate>
  );
}
