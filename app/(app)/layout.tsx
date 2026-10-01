"use client";

import { AccessGate } from "@/components/shell/access-gate";
import styles from "@/components/shell/page.module.css";
import { TopBar } from "@/components/shell/top-bar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AccessGate allow={["approved"]}>
      {(me) => (
        <>
          <TopBar tier={me.tier} />
          <main className={styles.page}>{children}</main>
        </>
      )}
    </AccessGate>
  );
}
