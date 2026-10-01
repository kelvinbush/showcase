"use client";

import { Search } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { Alert } from "@/components/arc/alert/alert";
import { Button } from "@/components/arc/button/button";
import { ChipGroup } from "@/components/arc/chip-group/chip-group";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { motionTokens } from "@/components/arc/lib/motion-tokens";
import { SearchField } from "@/components/arc/search-field/search-field";
import { Select } from "@/components/arc/select/select";
import { Skeleton } from "@/components/arc/skeleton/skeleton";
import { SmeTile, type TileVariant } from "@/components/sme/sme-tile";
import { richness, sectorLabel } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Showcase, SmeCard } from "@/lib/types";
import styles from "./browse.module.css";
import { Section } from "./section";
import { Sectors, topSectors } from "./sectors";
import { VideoStage } from "./video-stage";

// Radix Select has no empty value, so "all" stands in for "no filter".
const ALL = "all";
const PAGE = 24;

interface Filters {
  query: string;
  sectors: string[];
  country: string;
}

const NO_FILTERS: Filters = { query: "", sectors: [], country: ALL };

function matches(sme: SmeCard, filters: Filters): boolean {
  const query = filters.query.trim().toLowerCase();
  if (query) {
    const haystack = [
      sme.name,
      sme.tagline,
      sme.description,
      sme.city,
      sme.country,
      ...sme.sectors,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (
    filters.sectors.length > 0 &&
    !filters.sectors.some((s) => sme.sectors.includes(s))
  ) {
    return false;
  }
  return filters.country === ALL || sme.country === filters.country;
}

function Tiles({
  smes,
  variant = "card",
  className,
}: {
  smes: SmeCard[];
  variant?: TileVariant;
  className: string;
}) {
  const reduce = useReducedMotion();
  return (
    <ul className={className}>
      {smes.map((sme, index) => (
        <motion.li
          key={sme.id}
          className={styles.item}
          // Each tile rises into place the first time it scrolls into view.
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px" }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  ...motionTokens.spring.smooth,
                  delay: (index % 4) * motionTokens.stagger.item,
                }
          }
        >
          <SmeTile sme={sme} variant={variant} />
        </motion.li>
      ))}
    </ul>
  );
}

export function Browse({
  showcase,
  isError,
  onRetry,
}: {
  showcase: Showcase | undefined;
  isError: boolean;
  onRetry: () => void;
}) {
  const t = useT();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [shown, setShown] = useState(PAGE);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setShown(PAGE);
  };
  const clear = () => {
    setFilters(NO_FILTERS);
    setShown(PAGE);
  };

  const smes = showcase?.smes;
  const filtering = JSON.stringify(filters) !== JSON.stringify(NO_FILTERS);

  const results = useMemo(
    () => smes?.filter((sme) => matches(sme, filters)) ?? [],
    [smes, filters],
  );
  const curated = useMemo(() => {
    if (!smes) return null;
    const ranked = [...smes].sort((a, b) => richness(b) - richness(a));
    const withVideo = smes.filter((sme) => sme.videoUrl);
    return {
      lead: ranked[0],
      spotlight: ranked.slice(1, 5),
      sectors: topSectors(smes, 6),
      videoCount: withVideo.length,
      // Those with a photo lead, so the screen opens on a picture, not a blank.
      videos: withVideo
        .sort(
          (a, b) =>
            Number(Boolean(b.coverImage)) - Number(Boolean(a.coverImage)),
        )
        .slice(0, 6),
    };
  }, [smes]);

  if (isError) {
    return (
      <Alert tone="danger" title={t("browse.errorTitle")}>
        {t("browse.errorBody")}
        <div className={styles.retry}>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {t("common.tryAgain")}
          </Button>
        </div>
      </Alert>
    );
  }

  const toolbar = (
    <div className={styles.toolbar} id="browse">
      <div className={styles.row}>
        <SearchField
          label={t("browse.search")}
          placeholder={t("browse.searchPlaceholder")}
          value={filters.query}
          onValueChange={(value) => set("query", value)}
        />
        <Select
          label={t("browse.country")}
          value={filters.country}
          onValueChange={(value) => set("country", value)}
          options={[
            { value: ALL, label: t("browse.allCountries") },
            ...(showcase?.filters.countries ?? []).map((country) => ({
              value: country,
              label: country,
            })),
          ]}
        />
      </div>
      {showcase && showcase.filters.sectors.length > 0 && (
        <ChipGroup
          label={t("browse.sectors")}
          value={filters.sectors}
          onValueChange={(value) => set("sectors", value)}
          maxVisible={7}
          options={showcase.filters.sectors.map((sector) => ({
            value: sector,
            label: sectorLabel(sector),
          }))}
        />
      )}
    </div>
  );

  if (!showcase || !curated) {
    return (
      <>
        {toolbar}
        <div className={styles.grid} aria-busy="true">
          {["a", "b", "c", "d", "e", "f"].map((key) => (
            <div key={key} className={styles.placeholder}>
              <div className={styles.placeholderMedia} />
              <Skeleton lines={3} label={t("browse.loading")} />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (showcase.smes.length === 0) {
    return (
      <EmptyState
        icon={<Search size={24} strokeWidth={1.75} />}
        title={t("browse.noneTitle")}
        description={t("browse.noneBody")}
      />
    );
  }

  const more = results.length > shown && (
    <div className={styles.more}>
      <Button
        variant="secondary"
        size="lg"
        onClick={() => setShown((count) => count + PAGE)}
      >
        {t("browse.showMore")}
      </Button>
      <p>
        {t("browse.showing", {
          shown: Math.min(shown, results.length),
          total: results.length,
        })}
      </p>
    </div>
  );

  // While searching or filtering, the page is just the answer.
  if (filtering) {
    return (
      <>
        {toolbar}
        <Section
          number="→"
          label={t("section.results.label")}
          id="results-title"
          title={
            results.length === 0
              ? t("section.results.none")
              : results.length === 1
                ? t("section.results.titleOne")
                : t("section.results.title", { count: results.length })
          }
          accent={
            results.length === 0
              ? t("section.results.noneAccent")
              : t("section.results.accent")
          }
          aside={
            <Button variant="ghost" size="sm" onClick={clear}>
              {t("common.clearFilters")}
            </Button>
          }
        >
          {results.length === 0 ? (
            <EmptyState
              icon={<Search size={24} strokeWidth={1.75} />}
              title={t("browse.emptyTitle")}
              description={t("browse.emptyBody")}
              action={
                <Button variant="secondary" onClick={clear}>
                  {t("common.clearFilters")}
                </Button>
              }
            />
          ) : (
            <>
              <Tiles smes={results.slice(0, shown)} className={styles.grid} />
              {more}
            </>
          )}
        </Section>
      </>
    );
  }

  const hasVideos = curated.videos.length > 0;

  return (
    <>
      <Section
        number="01"
        anchor="spotlight"
        label={t("section.spotlight.label")}
        id="spotlight-title"
        title={t("section.spotlight.title")}
        accent={t("section.spotlight.accent")}
      >
        <div className={styles.bento}>
          <div className={styles.lead}>
            <SmeTile sme={curated.lead} variant="feature" priority />
          </div>
          <Tiles
            smes={curated.spotlight}
            variant="poster"
            className={styles.side}
          />
        </div>
      </Section>

      {curated.sectors.length > 1 && (
        <Section
          number="02"
          anchor="sectors"
          label={t("section.sectors.label")}
          id="sectors-title"
          title={t("section.sectors.title")}
          accent={t("section.sectors.accent")}
          aside={t("section.sectors.count", {
            count: showcase.filters.sectors.length,
          })}
        >
          <Sectors
            sectors={curated.sectors}
            onSelect={(sector) => {
              set("sectors", [sector]);
              document
                .getElementById("browse")
                ?.scrollIntoView({ block: "start" });
            }}
          />
        </Section>
      )}

      {hasVideos && (
        <Section
          number="03"
          anchor="videos"
          label={t("section.videos.label")}
          id="videos-title"
          title={t("section.videos.title")}
          accent={t("section.videos.accent")}
          aside={t("section.videos.count", { count: curated.videoCount })}
        >
          <VideoStage smes={curated.videos} />
        </Section>
      )}

      <Section
        number={hasVideos ? "04" : "03"}
        anchor="all"
        label={t("section.all.label")}
        id="all-title"
        title={t("section.all.title", { count: showcase.smes.length })}
        accent={t("section.all.accent", { count: showcase.smes.length })}
      >
        {toolbar}
        <Tiles smes={results.slice(0, shown)} className={styles.grid} />
        {more}
      </Section>
    </>
  );
}
