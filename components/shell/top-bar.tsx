"use client";

import { ArrowUp, LifeBuoy, Moon, Sun } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motionTokens } from "@/components/arc/lib/motion-tokens";
import { UserMenu } from "@/components/arc/user-menu/user-menu";
import { DEMO_MODE, OPEN_ACCESS } from "@/lib/config";
import { LocaleSync, setLocale, useLocale, useT } from "@/lib/i18n";
import {
  LOCALE_LABELS,
  LOCALES,
  type Locale,
  type MessageKey,
} from "@/lib/messages";
import { useSession } from "@/lib/session";
import { setTheme, useTheme } from "@/lib/theme";
import type { InvestorTier } from "@/lib/types";
import { Logo } from "./logo";
import styles from "./top-bar.module.css";

const TIER_LABEL: Record<InvestorTier, string> = {
  investor: "Investor",
  partner: "Partner",
};

/** The dashboard's sections, in page order. Ids match the Section anchors. */
export const PAGE_SECTIONS: { id: string; label: MessageKey }[] = [
  { id: "spotlight", label: "nav.spotlight" },
  { id: "sectors", label: "nav.sectors" },
  { id: "videos", label: "nav.videos" },
  { id: "all", label: "nav.all" },
];

/**
 * Tracks the scroll position: whether the page has left the top, and which
 * section is being read (the last one whose top has crossed the upper third
 * of the screen). Sections that are not on the page are skipped.
 */
function useScrollState(enabled: boolean) {
  const [scrolled, setScrolled] = useState(false);
  const [far, setFar] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [present, setPresent] = useState<string[]>([]);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      setFar(window.scrollY > window.innerHeight);
      if (!enabled) return;
      const line = window.innerHeight * 0.35;
      const found: string[] = [];
      let current: string | null = null;
      for (const { id } of PAGE_SECTIONS) {
        const element = document.getElementById(id);
        if (!element) continue;
        found.push(id);
        if (element.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
      setPresent((previous) =>
        previous.join() === found.join() ? previous : found,
      );
    };
    // Scroll fires far more often than the answer changes: one read per frame.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    // Sections arrive after the data loads, so look again shortly after mount.
    const late = window.setInterval(read, 1000);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.clearInterval(late);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled]);

  return { scrolled, far, active, present };
}

export function TopBar({ tier }: { tier?: InvestorTier | null }) {
  const t = useT();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const { user, isLoaded, signOut } = useSession();
  const theme = useTheme();
  const locale = useLocale();
  const onDashboard = pathname === "/";
  const { scrolled, far, active, present } = useScrollState(onDashboard);

  const sections = PAGE_SECTIONS.filter((section) =>
    present.includes(section.id),
  );

  return (
    <>
      <LocaleSync />
      <header className={styles.bar} data-scrolled={scrolled || undefined}>
        <div className={styles.inner}>
          <Link href="/" className={styles.brand} aria-label={t("common.home")}>
            <Logo />
          </Link>

          {/* A floating pill that follows the reader down the page. */}
          {onDashboard && sections.length > 1 && (
            <nav className={styles.nav} aria-label={t("nav.label")}>
              <ul className={styles.pill}>
                {sections.map((section) => {
                  const current = section.id === active;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className={styles.link}
                        aria-current={current ? "true" : undefined}
                      >
                        {current && (
                          <motion.span
                            layoutId="top-bar-active"
                            className={styles.highlight}
                            transition={
                              reduce
                                ? { duration: 0 }
                                : motionTokens.spring.morph
                            }
                            aria-hidden="true"
                          />
                        )}
                        <span>{t(section.label)}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          <div className={styles.actions}>
            <label className={styles.language}>
              <span className={styles.srOnly}>{t("common.language")}</span>
              <select
                value={locale}
                onChange={(event) => setLocale(event.target.value as Locale)}
              >
                {LOCALES.map((code) => (
                  <option key={code} value={code}>
                    {LOCALE_LABELS[code]}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className={styles.icon}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={t(
                theme === "dark" ? "common.themeToLight" : "common.themeToDark",
              )}
            >
              {theme === "dark" ? (
                <Sun size={18} strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Moon size={18} strokeWidth={1.75} aria-hidden="true" />
              )}
            </button>

            {user && (
              <UserMenu
                user={{
                  name: user.name,
                  email: user.email,
                  avatarSrc: user.avatarSrc,
                  plan: tier ? TIER_LABEL[tier] : undefined,
                }}
                showTheme={false}
                items={[
                  {
                    label: t("common.contact"),
                    icon: (
                      <LifeBuoy
                        size={16}
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    ),
                    onSelect: () => {
                      window.location.href =
                        "mailto:investors@melaninkapital.com";
                    },
                  },
                ]}
                onSignOut={signOut}
              />
            )}
            {isLoaded && !user && !OPEN_ACCESS && !DEMO_MODE && (
              <Link href="/sign-in" className={styles.signIn}>
                {t("common.signIn")}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* After a screen or so of scrolling, a quick way back up. */}
      <button
        type="button"
        className={styles.toTop}
        data-shown={far || undefined}
        aria-label={t("nav.top")}
        tabIndex={far ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0 })}
      >
        <ArrowUp size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </>
  );
}
