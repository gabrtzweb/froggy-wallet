"use client";

import { CreditCard, Landmark, LineChart, TrendingUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { InstitutionLogo } from "@/app/components/institution-logo";
import {
  CardPanel,
  CardPanelBody,
  CardPanelHeader,
  CardPanelKicker,
} from "@/app/components/ui/card-panel";
import { DashboardUnavailableCard } from "@/app/components/ui/dashboard-unavailable";
import { PageHeader } from "@/app/components/ui/page-header";
import {
  resolveInstitutionIdentity,
} from "@/app/lib/institution-utils";
import { useCachedApi } from "@/app/lib/use-cached-api";

type OverviewAccount = {
  id: string;
  name: string;
  displayName: string;
  maskedNumber: string;
  institutionName: string;
  institutionDomain: string;
  institutionLogoUrl: string;
  balance: number;
  currencyCode: string;
  type: string;
  subtype: string;
  itemId: string;
  creditLimit: number | null;
  availableCreditLimit: number | null;
  number: string;
};

type OverviewInvestment = {
  id: string;
  name: string;
  balance: number;
  type: string;
  status: string | null;
};

type OverviewData = {
  currencyCode: string;
  bankAccounts: OverviewAccount[];
  creditCards: OverviewAccount[];
  investments: OverviewInvestment[];
  bankTotal: number;
  creditOutstanding: number;
  creditLimit: number;
  creditUtilization: number;
  investmentTotal: number;
  investmentClasses: Array<{
    name: string;
    count: number;
    activeCount: number;
    inactiveCount: number;
    balance: number;
  }>;
  balanceHistory: Array<{
    label: string;
    value: number;
  }>;
  totalAccounts: number;
  totalAssets: number;
};

function formatCurrency(value: number, formatter: Intl.NumberFormat, currencyCode: string) {
  const formatted = formatter.format(value);

  if (currencyCode === "BRL") {
    return formatted.replace(/^R\$\s*/, "R$ ");
  }

  return formatted;
}

function buildLinePath(values: Array<{ value: number }>) {
  if (!values.length) {
    return "";
  }

  const width = 1000;
  const height = 220;
  const paddingX = 8;
  const paddingY = 18;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const maxValue = Math.max(...values.map((entry) => entry.value), 1);
  const minValue = Math.min(...values.map((entry) => entry.value), 0);
  const valueRange = Math.max(maxValue - minValue, 1);

  return values
    .map((entry, index) => {
      const x = paddingX + (index / Math.max(values.length - 1, 1)) * innerWidth;
      const normalizedValue = (entry.value - minValue) / valueRange;
      const y = height - paddingY - normalizedValue * innerHeight;
      const command = index === 0 ? "M" : "L";

      return `${command} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

type OverviewProps = {
  isPluggyAvailable?: boolean;
};

export function Overview({ isPluggyAvailable = true }: OverviewProps) {
  if (!isPluggyAvailable) {
    return <DashboardUnavailableCard />;
  }

  return <OverviewContent />;
}

function OverviewContent() {
  const locale = useLocale();
  const t = useTranslations("overview");
  const { data, errorMessage, isInitialLoading } = useCachedApi<OverviewData>(
    `/api/overview?locale=${encodeURIComponent(locale)}`,
  );

  const currencyCode = data?.currencyCode ?? "BRL";
  const formatMoney = useMemo(() => {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    });

    return (value: number) => formatCurrency(value, formatter, currencyCode);
  }, [locale, currencyCode]);

  const topBankAccounts = useMemo(() => (data?.bankAccounts ?? []).slice(0, 4), [data?.bankAccounts]);
  const topCreditCards = useMemo(() => (data?.creditCards ?? []).slice(0, 4), [data?.creditCards]);
  const topInvestmentClasses = useMemo(() => (data?.investmentClasses ?? []).slice(0, 3), [data?.investmentClasses]);
  const balanceHistory = useMemo(() => data?.balanceHistory ?? [], [data?.balanceHistory]);
  const chartPath = useMemo(() => buildLinePath(balanceHistory), [balanceHistory]);
  const chartFillPath = useMemo(() => {
    if (!chartPath) {
      return "";
    }

    return `${chartPath} L 1000 220 L 8 220 Z`;
  }, [chartPath]);
  const investmentSummary = useMemo(() => {
    const classes = data?.investmentClasses ?? [];
    return {
      classCount: classes.length,
      active: classes.reduce((sum, investmentClass) => sum + investmentClass.activeCount, 0),
      inactive: classes.reduce((sum, investmentClass) => sum + investmentClass.inactiveCount, 0),
    };
  }, [data?.investmentClasses]);
  const monthNetFlow = data?.balanceHistory.at(-1)?.value ?? 0;
  const isMonthNetNegative = monthNetFlow < 0;
  const topInvestmentClassShare =
    data && data.investmentTotal > 0 && topInvestmentClasses.length
      ? Math.max(0, Math.min(100, (topInvestmentClasses[0].balance / data.investmentTotal) * 100))
      : 0;
  const hasData = Boolean(data);
  const loading = isInitialLoading;

  return (
    <div className="app-page">
      <main className="app-page-main app-page-main--grid">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />

        {errorMessage ? <p className="statusBanner">{t("states.error")}: {errorMessage}</p> : null}

        <section className="overviewGrid" aria-label={t("title")}>
          <CardPanel className="panelTop">
            <CardPanelHeader>
              <CardPanelKicker>
                <Landmark size={14} aria-hidden="true" />
                {t("cards.accounts.title")}
              </CardPanelKicker>
            </CardPanelHeader>

            <CardPanelBody className="panelBodyGap">
              <p className="metricValue">
                {hasData ? formatMoney(data?.bankTotal ?? 0) : loading ? t("states.loadingShort") : formatMoney(0)}
              </p>

              <div className="accountList">
                {topBankAccounts.length ? (
                  topBankAccounts.map((account) => {
                    const identity = resolveInstitutionIdentity(account);

                    return (
                        <div className="accountRow" key={account.id}>
                          <InstitutionLogo institutionName={identity.name} institutionDomain={identity.domain} />
                          <div className="accountMeta">
                            <p>{identity.name}</p>
                            <span>{account.number}</span>
                          </div>
                          <strong>{formatMoney(account.balance)}</strong>
                        </div>
                    );
                  })
                ) : (
                  <div className="emptyState">{loading ? t("states.loading") : t("states.noBankAccounts")}</div>
                )}
              </div>
            </CardPanelBody>
          </CardPanel>

          <CardPanel className="panelTop">
            <CardPanelHeader>
              <CardPanelKicker>
                <CreditCard size={14} aria-hidden="true" />
                {t("cards.creditCards.title")}
              </CardPanelKicker>
            </CardPanelHeader>

            <CardPanelBody className="panelBodyGap">
              <p className="metricValue creditValue">
                {hasData ? formatMoney(data?.creditOutstanding ?? 0) : loading ? t("states.loadingShort") : formatMoney(0)}
              </p>
              <p className="smallMeta">
                {hasData ? t("cards.creditCards.utilization", { value: Math.round((data?.creditUtilization ?? 0) * 100) }) : t("cards.creditCards.utilization", { value: 0 })}
              </p>

              <div className="progressTrack" aria-hidden="true">
                <span
                  className="progressFill"
                  style={{ width: `${Math.max(3, Math.min(100, (data?.creditUtilization ?? 0) * 100))}%` }}
                />
              </div>

              <div className="creditList">
                {topCreditCards.length ? (
                  topCreditCards.map((account) => {
                    const identity = resolveInstitutionIdentity(account);

                    return (
                        <div className="creditRow" key={account.id}>
                          <InstitutionLogo institutionName={identity.name} institutionDomain={identity.domain} small />
                          <div className="creditMeta">
                            <p>{account.displayName}</p>
                            <span>{account.maskedNumber}</span>
                          </div>
                          <strong>{formatMoney(account.balance)}</strong>
                        </div>
                    );
                  })
                ) : (
                  <div className="emptyState">{loading ? t("states.loading") : t("states.noCreditCards")}</div>
                )}
              </div>
            </CardPanelBody>
          </CardPanel>

          <CardPanel className="panelTop">
            <CardPanelHeader>
              <CardPanelKicker>
                <TrendingUp size={14} aria-hidden="true" />
                {t("cards.investments.title")}
              </CardPanelKicker>
            </CardPanelHeader>

            <CardPanelBody className="panelBodyGap">
              <p className="metricValue investValue">
                {hasData ? formatMoney(data?.investmentTotal ?? 0) : loading ? t("states.loadingShort") : formatMoney(0)}
              </p>
              <p className="smallMeta">
                {hasData
                  ? t("cards.investments.summary", {
                      classes: investmentSummary.classCount,
                      assets: data?.investments.length ?? 0,
                      active: investmentSummary.active,
                      inactive: investmentSummary.inactive,
                    })
                  : t("cards.investments.summaryFallback")}
              </p>

              <p className="smallMeta">
                {t("cards.investments.allocationHint", {
                  value: Math.round(topInvestmentClassShare),
                })}
              </p>

              {topInvestmentClasses.length ? (
                topInvestmentClasses.map((investmentClass) => (
                  <div className="investmentRow" key={investmentClass.name}>
                    <span>
                      {investmentClass.name} ({investmentClass.count})
                    </span>
                    <strong>{formatMoney(investmentClass.balance)}</strong>
                  </div>
                ))
              ) : (
                <div className="emptyState">{loading ? t("states.loading") : t("states.noInvestments")}</div>
              )}

              <div className="progressTrack" aria-hidden="true">
                <span
                  className="progressFill tinyFill"
                  style={{ width: `${hasData ? Math.max(0, topInvestmentClassShare) : 0}%` }}
                />
              </div>
            </CardPanelBody>
          </CardPanel>

          <CardPanel className="panelBottom">
            <CardPanelHeader>
              <CardPanelKicker>
                <LineChart size={14} aria-hidden="true" />
                {t("cards.balanceHistory.title")}
              </CardPanelKicker>
            </CardPanelHeader>

            <CardPanelBody className="chartBody">
              <p className={`metricValue ${isMonthNetNegative ? "negativeFlow" : ""}`}>
                {hasData
                  ? formatMoney(monthNetFlow)
                  : loading
                    ? t("states.loadingShort")
                    : formatMoney(0)}
              </p>

              <p className="smallMeta">
                {t("cards.balanceHistory.explanation")}
              </p>

              <div className="chartMock">
                <svg
                  viewBox="0 0 1000 240"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={t("cards.balanceHistory.aria")}
                >
                  <defs>
                    <linearGradient id="overviewLineFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(45, 190, 100, 0.42)" />
                      <stop offset="100%" stopColor="rgba(45, 190, 100, 0)" />
                    </linearGradient>
                  </defs>
                  {chartFillPath ? <path d={chartFillPath} className="lineArea" /> : null}
                  {chartPath ? <path d={chartPath} className="lineStroke" /> : null}
                </svg>

                <div
                  className="chartLabels"
                  aria-hidden="true"
                  style={{ gridTemplateColumns: `repeat(${Math.max(balanceHistory.length, 1)}, minmax(0, 1fr))` }}
                >
                  {balanceHistory.map((point) => (
                    <span key={point.label}>{point.label}</span>
                  ))}
                </div>
              </div>
            </CardPanelBody>
          </CardPanel>
        </section>
      </main>

      <style jsx global>{`
        .overviewGrid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .panelBottom {
          grid-column: 1 / -1;
          min-height: 260px;
        }

        .panelBodyGap {
          display: grid;
          gap: 0.6rem;
        }

        .statusBanner {
          margin: 0;
          padding: 0.78rem 0.9rem;
          border-radius: 13px;
          border: 1px solid color-mix(in srgb, #e44b4b 24%, var(--glass-border));
          background: color-mix(in srgb, #e44b4b 10%, transparent);
          color: color-mix(in srgb, var(--foreground) 88%, transparent);
          font-size: var(--font-size-base);
        }

        .metricValue {
          margin: 0;
          font-family: var(--font-heading);
          font-size: var(--font-size-heading);
          font-weight: 700;
          color: color-mix(in srgb, var(--foreground) 96%, transparent);
        }

        .creditValue {
          color: color-mix(in srgb, #e44b4b 78%, var(--foreground) 22%);
        }

        .investValue {
          color: color-mix(in srgb, var(--primary) 84%, var(--foreground) 16%);
        }

        .negativeFlow {
          color: color-mix(in srgb, #e44b4b 78%, var(--foreground) 22%);
        }

        .smallMeta {
          margin: 0;
          color: color-mix(in srgb, var(--foreground) 56%, transparent);
          font-size: var(--font-size-base);
        }

        .accountList,
        .creditList {
          margin-top: 0.18rem;
          border-top: 1px solid color-mix(in srgb, var(--divider) 75%, transparent);
        }

        .accountRow,
        .creditRow {
          min-height: 52px;
          display: grid;
          align-items: center;
          gap: 0.62rem;
          border-bottom: 1px solid color-mix(in srgb, var(--divider) 58%, transparent);
        }

        .accountRow {
          grid-template-columns: 34px 1fr auto;
        }

        .creditRow {
          grid-template-columns: 28px 1fr auto;
        }

        .emptyState {
          padding: 0.85rem 0;
          color: color-mix(in srgb, var(--foreground) 56%, transparent);
          font-size: var(--font-size-base);
        }

        .accountMeta p,
        .creditRow p {
          margin: 0;
          font-size: var(--font-size-base);
          font-weight: 700;
          color: color-mix(in srgb, var(--foreground) 88%, transparent);
        }

        .accountMeta span {
          display: block;
          font-size: var(--font-size-sm);
          color: color-mix(in srgb, var(--foreground) 54%, transparent);
        }

        .creditMeta span {
          display: block;
          font-size: var(--font-size-sm);
          color: color-mix(in srgb, var(--foreground) 54%, transparent);
        }

        .accountRow strong,
        .creditRow strong,
        .investmentRow strong {
          font-size: var(--font-size-base);
          color: color-mix(in srgb, var(--foreground) 90%, transparent);
        }

        .progressTrack {
          position: relative;
          width: 100%;
          height: 8px;
          border-radius: 999px;
          border: 1px solid color-mix(in srgb, var(--glass-border) 78%, transparent);
          background: color-mix(in srgb, var(--background) 24%, transparent);
          overflow: hidden;
        }

        .progressFill {
          display: block;
          width: 42%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            color-mix(in srgb, #f59f00 86%, transparent),
            color-mix(in srgb, #ffca2a 86%, transparent)
          );
        }

        .tinyFill {
          width: 3%;
          background: linear-gradient(
            90deg,
            color-mix(in srgb, var(--primary) 76%, transparent),
            color-mix(in srgb, var(--accent) 76%, transparent)
          );
        }

        .investmentRow {
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          color: color-mix(in srgb, var(--foreground) 78%, transparent);
          font-size: var(--font-size-base);
        }

        .chartBody {
          display: grid;
          gap: 0.55rem;
        }

        .chartMock {
          display: grid;
          gap: 0.5rem;
          width: 100%;
          height: 170px;
          border-top: 1px solid color-mix(in srgb, var(--divider) 72%, transparent);
          padding-top: 0.9rem;
        }

        .chartMock svg {
          width: 100%;
          height: 100%;
        }

        .lineArea {
          fill: url(#overviewLineFill);
          stroke: none;
        }

        .lineStroke {
          fill: none;
          stroke: color-mix(in srgb, var(--primary) 85%, var(--foreground) 15%);
          stroke-width: 2.5;
        }

        .chartLabels {
          display: grid;
          gap: 0.3rem;
          font-size: var(--font-size-sm);
          color: color-mix(in srgb, var(--foreground) 44%, transparent);
        }

        .chartLabels span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 1180px) {
          .overviewGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .panelBottom {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .overviewGrid {
            grid-template-columns: 1fr;
          }

          .panelTop,
          .panelBottom {
            min-height: auto;
          }
        }

        @media (max-width: 640px) {
          .chartMock {
            height: 152px;
          }

        }
      `}</style>
    </div>
  );
}