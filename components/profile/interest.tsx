"use client";

import { useState } from "react";
import { Alert } from "@/components/arc/alert/alert";
import { Button } from "@/components/arc/button/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/arc/dialog/dialog";
import { Textarea } from "@/components/arc/textarea/textarea";
import { ApiError, useExpressInterest } from "@/lib/api";
import type { SmeDetail } from "@/lib/types";
import styles from "./interest.module.css";

const LIMIT = 2000;

/**
 * The profile's one primary action. Interest is sent once per business; after
 * that the button reports the state in place and the team follows up by email.
 */
export function Interest({ sme }: { sme: SmeDetail }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const send = useExpressInterest(sme.id);

  const sent = sme.interest !== null || send.isSuccess;
  // The API rejects a second request; treat that as already sent, not as a failure.
  const alreadySent =
    send.error instanceof ApiError && send.error.status === 409;

  if (sent || alreadySent) {
    return (
      <Alert tone="success" title="Interest sent">
        The Melanin Kapital team will be in touch by email to arrange an
        introduction.
      </Alert>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="lg" className={styles.trigger}>
          Express interest
        </Button>
      </DialogTrigger>
      <DialogContent
        title={`Express interest in ${sme.name}`}
        description="We will share your details with the Melanin Kapital team, who will arrange an introduction."
      >
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            send.mutate(message.trim() || null, {
              onSuccess: () => setOpen(false),
            });
          }}
        >
          <Textarea
            label="Message (optional)"
            placeholder="What caught your attention, and what would you like to know?"
            rows={5}
            maxLength={LIMIT}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            description={`${LIMIT - message.length} characters left`}
            error={
              send.isError && !alreadySent
                ? "Your interest could not be sent. Try again."
                : undefined
            }
          />
          <div className={styles.actions}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={send.isPending}>
              Send interest
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
