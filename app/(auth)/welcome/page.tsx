import Link from "next/link";
import { T } from "@/lib/i18n";
import styles from "../layout.module.css";

/** Where a signed-out visitor lands: request access first, sign in second. */
export default function WelcomePage() {
  return (
    <div className={styles.welcome}>
      <h2 className={styles.welcomeTitle}>
        <T k="welcome.title" />
      </h2>
      <p className={styles.welcomeText}>
        <T k="welcome.body" />
      </p>
      <Link href="/request-access" className={styles.demoLink}>
        <T k="welcome.request" />
      </Link>
      <p className={styles.welcomeAlt}>
        <T k="welcome.approved" />{" "}
        <Link href="/sign-in">
          <T k="common.signIn" />
        </Link>
      </p>
    </div>
  );
}
