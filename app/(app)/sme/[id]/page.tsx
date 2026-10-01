"use client";

import { ArrowLeft, ArrowUpRight, SearchX } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Alert } from "@/components/arc/alert/alert";
import { Avatar } from "@/components/arc/avatar/avatar";
import { Button } from "@/components/arc/button/button";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { Skeleton } from "@/components/arc/skeleton/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/arc/tabs/tabs";
import { Impact } from "@/components/profile/impact";
import { Media } from "@/components/profile/media";
import { SmeCover } from "@/components/sme/cover";
import { ApiError, useSme } from "@/lib/api";
import { logoSrc, place, sectorLabel } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { SmeDetail } from "@/lib/types";
import styles from "./page.module.css";

// The dashboard presents businesses; it does not pitch them. Funding asks,
// revenue, the Melanin Kapital lending record and the "express interest"
// action are all left out for now. The data and the components
// (components/profile/interest.tsx) are still there to bring back.

function BackLink() {
  const t = useT();
  return (
    <Link href="/" className={styles.back}>
      <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
      {t("profile.back")}
    </Link>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.fact}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Overview({ sme }: { sme: SmeDetail }) {
  const t = useT();
  return (
    <div className={styles.stack}>
      {sme.summary ? (
        <div className={styles.prose}>
          {sme.summary.split(/\n{2,}/).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className={styles.muted}>{t("tile.noDescription")}</p>
      )}
      <Media name={sme.name} videos={sme.videos} photos={sme.photos} />
    </div>
  );
}

function Profile({ sme }: { sme: SmeDetail }) {
  const t = useT();
  const where = place(sme);
  return (
    <>
      <header className={styles.hero}>
        <SmeCover
          name={sme.name}
          src={sme.coverImage}
          sizes="(max-width: 1264px) 100vw, 1200px"
          priority
          className={styles.cover}
        />
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.pills}>
          {sme.sectors.slice(0, 3).map((sector) => (
            <span key={sector} className={styles.pill}>
              {sectorLabel(sector)}
            </span>
          ))}
        </div>
        <div className={styles.identity}>
          <Avatar name={sme.name} src={logoSrc(sme.logo)} size="lg" />
          <div className={styles.titles}>
            <h1 className={styles.title}>{sme.name}</h1>
            {(sme.tagline || where) && (
              <p className={styles.tagline}>{sme.tagline ?? where}</p>
            )}
          </div>
        </div>
      </header>

      <div className={styles.columns}>
        <Tabs defaultValue="overview" className={styles.main}>
          <TabsList aria-label={t("profile.tabs", { name: sme.name })}>
            <TabsTrigger value="overview">{t("profile.overview")}</TabsTrigger>
            <TabsTrigger value="impact">{t("profile.impact")}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className={styles.panel}>
            <Overview sme={sme} />
          </TabsContent>
          <TabsContent value="impact" className={styles.panel}>
            <Impact sme={sme} />
          </TabsContent>
        </Tabs>

        <aside className={styles.aside} aria-label={t("profile.glance")}>
          <h2 className={styles.asideTitle}>{t("profile.glance")}</h2>
          <dl className={styles.facts}>
            <Fact
              label={t("profile.basedIn")}
              value={where || t("common.notShared")}
            />
            {sme.yearFounded && (
              <Fact label={t("profile.founded")} value={sme.yearFounded} />
            )}
            {sme.employees !== null && (
              <Fact
                label={t("profile.team")}
                value={t("tile.people", { count: sme.employees })}
              />
            )}
            {sme.womenEmployeesPct !== null && (
              <Fact
                label={t("profile.womenInTeam")}
                value={`${sme.womenEmployeesPct}%`}
              />
            )}
            {sme.countriesOfOperation.length > 0 && (
              <Fact
                label={t("profile.operatesIn")}
                value={sme.countriesOfOperation.join(", ")}
              />
            )}
            {sme.sectors.length > 0 && (
              <Fact
                label={t("profile.sectors")}
                value={sme.sectors.map(sectorLabel).join(", ")}
              />
            )}
            {sme.programs.length > 0 && (
              <Fact
                label={t("profile.programmes")}
                value={sme.programs.join(", ")}
              />
            )}
            {sme.twoXCriteria.length > 0 && (
              <Fact
                label={t("profile.twoX")}
                value={sme.twoXCriteria.join(", ")}
              />
            )}
          </dl>
          {sme.website && (
            <a
              href={sme.website}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.website}
            >
              {t("profile.website")}
              <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </a>
          )}
        </aside>
      </div>
    </>
  );
}

export default function SmePage({ params }: PageProps<"/sme/[id]">) {
  const t = useT();
  const { id } = use(params);
  const { data: sme, error, isError, refetch, isFetching } = useSme(id);

  if (error instanceof ApiError && error.status === 404) {
    return (
      <EmptyState
        icon={<SearchX size={24} strokeWidth={1.75} />}
        title={t("profile.missingTitle")}
        description={t("profile.missingBody")}
        action={
          <Link href="/" className={styles.back}>
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
            {t("profile.backLong")}
          </Link>
        }
      />
    );
  }

  return (
    <article className={styles.profile}>
      <BackLink />
      {isError ? (
        <Alert tone="danger" title={t("profile.errorTitle")}>
          {t("browse.errorBody")}
          <div className={styles.retry}>
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
      ) : sme ? (
        <Profile sme={sme} />
      ) : (
        <div className={styles.loading} aria-busy="true">
          <div className={styles.hero} />
          <Skeleton lines={5} label={t("profile.loading")} />
        </div>
      )}
    </article>
  );
}
