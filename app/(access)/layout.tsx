import Image from "next/image";
import { TopBar } from "@/components/shell/top-bar";
import { T } from "@/lib/i18n";
import styles from "./layout.module.css";

export default function AccessLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <TopBar />
      <main className={styles.split}>
        <div className={styles.content}>{children}</div>
        <aside className={styles.aside}>
          {/* A real Melanin Kapital photograph, from the public website. */}
          <Image
            src="/media/founders.jpg"
            alt=""
            fill
            sizes="(max-width: 960px) 100vw, 440px"
            priority
          />
          <p className={styles.caption}>
            <span>
              <T k="request.asideTitle" />
            </span>
            <T k="request.asideBody" />
          </p>
        </aside>
      </main>
    </>
  );
}
