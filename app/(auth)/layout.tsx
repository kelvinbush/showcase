import Image from "next/image";
import { Logo } from "@/components/shell/logo";
import { T } from "@/lib/i18n";
import styles from "./layout.module.css";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className={styles.auth}>
      <section className={styles.pitch}>
        <Image
          src="/media/meeting.jpg"
          alt=""
          fill
          sizes="(max-width: 860px) 100vw, 50vw"
          priority
          className={styles.backdrop}
        />
        <div className={styles.pitchInner}>
          <div className={styles.brand}>
            <Logo />
          </div>
          <div className={styles.pitchCopy}>
            <h1 className={styles.title}>
              <T k="auth.title" />
            </h1>
            <ul className={styles.points}>
              <li>
                <T k="auth.point1" />
              </li>
              <li>
                <T k="auth.point2" />
              </li>
              <li>
                <T k="auth.point3" />
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section className={styles.form}>{children}</section>
    </main>
  );
}
