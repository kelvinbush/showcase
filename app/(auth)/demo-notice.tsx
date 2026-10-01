"use client";

import Link from "next/link";
import { Alert } from "@/components/arc/alert/alert";
import { useT } from "@/lib/i18n";
import styles from "./layout.module.css";

/** Shown in place of the Clerk form when the app runs on fixture data. */
export function DemoNotice() {
  const t = useT();
  return (
    <div className={styles.demo}>
      <Alert tone="info" title={t("demo.title")}>
        {t("demo.body")}
      </Alert>
      <Link href="/" className={styles.demoLink}>
        {t("demo.open")}
      </Link>
    </div>
  );
}
