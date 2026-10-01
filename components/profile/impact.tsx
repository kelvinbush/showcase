"use client";

import { BarChart3 } from "lucide-react";
import { BarChart } from "@/components/arc/bar-chart/bar-chart";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { LineChart } from "@/components/arc/line-chart/line-chart";
import { MetricCard } from "@/components/arc/metric-card/metric-card";
import { WaffleChart } from "@/components/arc/waffle-chart/waffle-chart";
import { useT } from "@/lib/i18n";
import type { SmeDetail } from "@/lib/types";
import styles from "./impact.module.css";

// Formatted with a fixed locale and time zone so server and client agree.
const PERIOD = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const period = (date: string) => PERIOD.format(new Date(`${date}T00:00:00Z`));
/** "Jun 24": short enough to sit under a bar. */
const shortPeriod = (date: string) => {
  const [month, year] = period(date).split(" ");
  return `${month} ${year.slice(2)}`;
};

export function Impact({ sme }: { sme: SmeDetail }) {
  const t = useT();
  const reports = sme.impact;
  const latest = reports.at(-1);

  const revenue = reports.filter((report) => report.revenueIndex !== null);
  const jobs = reports.filter((report) => report.totalEmployees !== null);
  const first = revenue.at(0);
  const last = revenue.at(-1);
  const growth =
    first?.revenueIndex && last?.revenueIndex && revenue.length > 1
      ? Math.round((last.revenueIndex / first.revenueIndex - 1) * 100)
      : null;

  const team = latest?.totalEmployees ?? sme.employees;
  const women =
    latest?.femaleEmployees != null && latest.totalEmployees
      ? Math.round((latest.femaleEmployees / latest.totalEmployees) * 100)
      : sme.womenEmployeesPct;

  if (reports.length === 0 && team === null) {
    return (
      <EmptyState
        icon={<BarChart3 size={24} strokeWidth={1.75} />}
        title={t("impact.emptyTitle")}
        description={t("impact.emptyBody")}
      />
    );
  }

  return (
    <div className={styles.impact}>
      <div className={styles.metrics}>
        {team !== null && (
          <MetricCard
            label={t("impact.team")}
            value={team}
            context={t("impact.teamContext")}
          />
        )}
        {women !== null && (
          <MetricCard
            label={t("impact.women")}
            value={women}
            suffix="%"
            context={t("impact.share")}
          />
        )}
        {sme.youthEmployeesPct !== null && (
          <MetricCard
            label={t("impact.youth")}
            value={sme.youthEmployeesPct}
            suffix="%"
            context={t("impact.share")}
          />
        )}
        {growth !== null && (
          <MetricCard
            label={t("impact.growth")}
            value={growth}
            suffix="%"
            context={t("impact.since", {
              date: period(first?.reportingDate ?? ""),
            })}
          />
        )}
      </div>

      {revenue.length > 1 && (
        <figure className={styles.panel}>
          <figcaption className={styles.caption}>
            <h3>{t("impact.trendTitle")}</h3>
            <p>{t("impact.trendBody")}</p>
          </figcaption>
          <LineChart
            label={t("impact.index")}
            categoryLabel={t("impact.period")}
            data={revenue.map((report) => ({
              key: report.reportingDate,
              label: period(report.reportingDate),
              axisLabel: period(report.reportingDate),
              values: { index: report.revenueIndex ?? 0 },
            }))}
            series={[{ key: "index", label: t("impact.index") }]}
            formatValue={(value) => String(Math.round(value))}
          />
        </figure>
      )}

      <div className={styles.split}>
        {jobs.length > 1 && (
          <figure className={styles.panel}>
            <BarChart
              label={t("impact.teamSize")}
              period={t("impact.range", {
                from: period(jobs[0].reportingDate),
                to: period(jobs.at(-1)?.reportingDate ?? ""),
              })}
              unit={t("impact.people")}
              averageLabel={t("impact.teamAverage")}
              valueLabel={t("impact.team")}
              categoryLabel={t("impact.period")}
              data={jobs.map((report) => ({
                key: report.reportingDate,
                label: period(report.reportingDate),
                axisLabel: shortPeriod(report.reportingDate),
                value: report.totalEmployees ?? 0,
              }))}
            />
          </figure>
        )}
        {women !== null && (
          <figure className={styles.panel}>
            <figcaption className={styles.caption}>
              <h3>{t("impact.whoTitle")}</h3>
              <p>{t("impact.whoBody")}</p>
            </figcaption>
            <WaffleChart
              label={t("impact.workforce", { name: sme.name })}
              data={[
                { key: "women", label: t("impact.women"), value: women },
                { key: "men", label: t("impact.men"), value: 100 - women },
              ]}
              formatValue={(value) => `${value}%`}
            />
          </figure>
        )}
      </div>
    </div>
  );
}
