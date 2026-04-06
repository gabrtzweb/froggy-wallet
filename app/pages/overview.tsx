"use client";

import { CreditCard, Landmark, LineChart, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

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

function formatCurrency(value: number, locale: string, currencyCode: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
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

type BankIdentity = {
  name: string;
  domain: string;
};

const KNOWN_ITEMS: Record<string, { name: string; domain: string }> = {
  "26edf1e1-f9f1-466f-90b5-946cf3702339": { name: "Nubank", domain: "nubank.com.br" },
  "65178410-02ad-4ab6-a0ea-8f27582436a0": { name: "Inter", domain: "inter.co" },
};

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function getBankIdentity(rawName: string): BankIdentity {
  const normalizedName = normalizeText(rawName);

  const mappings: Array<{ test: RegExp; identity: BankIdentity }> = [
    { test: /nu pagamentos|nubank|nu bank/, identity: { name: "Nubank", domain: "nubank.com.br" } },
    { test: /banco inter|inter\b/, identity: { name: "Inter", domain: "inter.co" } },
    { test: /banco do brasil|bb\b/, identity: { name: "Banco do Brasil", domain: "bb.com.br" } },
    { test: /itau|itaú/, identity: { name: "Itaú", domain: "itau.com.br" } },
    { test: /bradesco/, identity: { name: "Bradesco", domain: "bradesco.com.br" } },
    { test: /santander/, identity: { name: "Santander", domain: "santander.com.br" } },
    { test: /caixa/, identity: { name: "Caixa", domain: "caixa.gov.br" } },
    { test: /c6/, identity: { name: "C6 Bank", domain: "c6bank.com.br" } },
    { test: /neon/, identity: { name: "Neon", domain: "neon.com.br" } },
    { test: /next/, identity: { name: "next", domain: "next.me" } },
    { test: /picpay/, identity: { name: "PicPay", domain: "picpay.com" } },
    { test: /mercado pago|mercadopago/, identity: { name: "Mercado Pago", domain: "mercadopago.com.br" } },
    { test: /sicoob/, identity: { name: "Sicoob", domain: "sicoob.com.br" } },
    { test: /sicredi/, identity: { name: "Sicredi", domain: "sicredi.com.br" } },
    { test: /btg/, identity: { name: "BTG Pactual", domain: "btgpactual.com" } },
    { test: /will bank/, identity: { name: "Will Bank", domain: "willbank.com.br" } },
    { test: /pagbank|pagseguro/, identity: { name: "PagBank", domain: "pagbank.com.br" } },
    { test: /original/, identity: { name: "Banco Original", domain: "bancooriginal.com.br" } },
    { test: /pan/, identity: { name: "Banco Pan", domain: "bancopan.com.br" } },
  ];

  for (const mapping of mappings) {
    if (mapping.test.test(normalizedName)) {
      return mapping.identity;
    }
  }

  return {
    name: rawName,
    domain: "",
  };
}

function getDisplayBankIdentity(
  account: Pick<OverviewAccount, "name" | "institutionName" | "institutionDomain" | "itemId">,
) {
  if (account.itemId && KNOWN_ITEMS[account.itemId]) {
    return KNOWN_ITEMS[account.itemId];
  }

  const combinedName = `${account.institutionName || ""} ${account.name || ""}`;
  const identity = getBankIdentity(combinedName);

  return {
    name: identity.domain ? identity.name : (account.institutionName || account.name),
    domain: identity.domain || account.institutionDomain,
  };
}

function getBankLogoUrl(domain: string) {
  if (!domain) return "";
  return `https://logos-api.apistemic.com/domain:${domain}`;
}

function createFallbackLogoDataUrl(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
    <rect width="96" height="96" rx="18" fill="#0f1812"/>
    <rect x="1" y="1" width="94" height="94" rx="17" stroke="rgba(255,255,255,0.12)"/>
    <text x="48" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#eafaf0">${initials || "?"}</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function InstitutionLogo({
  institutionName,
  institutionDomain,
  small = false,
}: {
  institutionName: string;
  institutionDomain: string;
  small?: boolean;
}) {
  const [useFallbackSource, setUseFallbackSource] = useState(false);
  const source =
    useFallbackSource || !institutionDomain
      ? createFallbackLogoDataUrl(institutionName)
      : getBankLogoUrl(institutionDomain);

  // For SVGs, let them fill the badge edge-to-edge. For raster, use cover.
  // Next.js Image will not blur SVGs, but for PNG/JPG, we want sharpness.
  return (
    <span className={`institutionLogo ${small ? "institutionLogoSm" : ""}`} aria-hidden="true">
      <Image
        className="institutionLogoImage"
        src={source}
        alt=""
        aria-hidden="true"
        width={small ? 28 : 34}
        height={small ? 28 : 34}
        sizes={small ? "28px" : "34px"}
        quality={100}
        unoptimized={source.endsWith('.svg') || source.startsWith('data:image/svg+xml')}
        onError={() => {
          setUseFallbackSource(true);
        }}
        priority
      />
    </span>
  );
}

export function Overview() {
  const locale = useLocale();
  const t = useTranslations("overview");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/overview?locale=${encodeURIComponent(locale)}`, {
          signal: abortController.signal,
        });

        const payload = (await response.json()) as OverviewData & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load overview data");
        }

        setData(payload);
      } catch (loadError) {
        if ((loadError as { name?: string }).name === "AbortError") {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Failed to load overview data");
      } finally {
        setLoading(false);
      }
    }

    void loadOverview();

    return () => {
      abortController.abort();
    };
  }, [locale]);

  const currencyCode = data?.currencyCode ?? "BRL";
  const chartPath = useMemo(() => buildLinePath(data?.balanceHistory ?? []), [data]);
  const chartFillPath = useMemo(() => {
    if (!chartPath) {
      return "";
    }

    return `${chartPath} L 1000 220 L 8 220 Z`;
  }, [chartPath]);
  const topBankAccounts = (data?.bankAccounts ?? []).slice(0, 4);
  const topCreditCards = (data?.creditCards ?? []).slice(0, 4);
  const topInvestmentClasses = (data?.investmentClasses ?? []).slice(0, 3);
  const hasData = Boolean(data && !error);

  return (
    <div className="overviewPage">
      <main className="overviewMain">
        <header className="page-header-block">
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </header>

        {error ? <p className="statusBanner">{t("states.error")}: {error}</p> : null}

        <section className="overviewGrid" aria-label={t("title")}>
          <article className="card-panel panelTop">
            <header className="card-panel-header">
              <p className="card-panel-kicker">
                <Landmark size={14} aria-hidden="true" />
                {t("cards.accounts.title")}
              </p>
            </header>

            <div className="card-panel-body panelBodyGap">
              <p className="metricValue">
                {hasData ? formatCurrency(data?.bankTotal ?? 0, locale, currencyCode) : loading ? t("states.loadingShort") : formatCurrency(0, locale, currencyCode)}
              </p>

              <div className="accountList">
                {topBankAccounts.length ? (
                  topBankAccounts.map((account) => {
                    const identity = getDisplayBankIdentity(account);

                    return (
                        <div className="accountRow" key={account.id}>
                          <InstitutionLogo institutionName={identity.name} institutionDomain={identity.domain} />
                          <div className="accountMeta">
                            <p>{identity.name}</p>
                            <span>{account.number}</span>
                          </div>
                          <strong>{formatCurrency(account.balance, locale, account.currencyCode)}</strong>
                        </div>
                    );
                  })
                ) : (
                  <div className="emptyState">{loading ? t("states.loading") : t("states.noBankAccounts")}</div>
                )}
              </div>
            </div>
          </article>

          <article className="card-panel panelTop">
            <header className="card-panel-header">
              <p className="card-panel-kicker">
                <CreditCard size={14} aria-hidden="true" />
                {t("cards.creditCards.title")}
              </p>
            </header>

            <div className="card-panel-body panelBodyGap">
              <p className="metricValue creditValue">
                {hasData ? formatCurrency(data?.creditOutstanding ?? 0, locale, currencyCode) : loading ? t("states.loadingShort") : formatCurrency(0, locale, currencyCode)}
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
                    const identity = getDisplayBankIdentity(account);

                    return (
                        <div className="creditRow" key={account.id}>
                          <InstitutionLogo institutionName={identity.name} institutionDomain={identity.domain} small />
                          <div className="creditMeta">
                            <p>{account.displayName}</p>
                            <span>{account.maskedNumber}</span>
                          </div>
                          <strong>{formatCurrency(account.balance, locale, account.currencyCode)}</strong>
                        </div>
                    );
                  })
                ) : (
                  <div className="emptyState">{loading ? t("states.loading") : t("states.noCreditCards")}</div>
                )}
              </div>
            </div>
          </article>

          <article className="card-panel panelTop">
            <header className="card-panel-header">
              <p className="card-panel-kicker">
                <TrendingUp size={14} aria-hidden="true" />
                {t("cards.investments.title")}
              </p>
            </header>

            <div className="card-panel-body panelBodyGap">
              <p className="metricValue investValue">
                {hasData ? formatCurrency(data?.investmentTotal ?? 0, locale, currencyCode) : loading ? t("states.loadingShort") : formatCurrency(0, locale, currencyCode)}
              </p>
              <p className="smallMeta">
                {hasData
                  ? t("cards.investments.summary", {
                      classes: data?.investmentClasses.length ?? 0,
                      assets: data?.investments.length ?? 0,
                      active: data?.investmentClasses.reduce((sum, investmentClass) => sum + investmentClass.activeCount, 0) ?? 0,
                      inactive: data?.investmentClasses.reduce((sum, investmentClass) => sum + investmentClass.inactiveCount, 0) ?? 0,
                    })
                  : t("cards.investments.summaryFallback")}
              </p>

              {topInvestmentClasses.length ? (
                topInvestmentClasses.map((investmentClass) => (
                  <div className="investmentRow" key={investmentClass.name}>
                    <span>
                      {investmentClass.name} ({investmentClass.count})
                    </span>
                    <strong>{formatCurrency(investmentClass.balance, locale, currencyCode)}</strong>
                  </div>
                ))
              ) : (
                <div className="emptyState">{loading ? t("states.loading") : t("states.noInvestments")}</div>
              )}

              <div className="progressTrack" aria-hidden="true">
                <span className="progressFill tinyFill" style={{ width: hasData ? "18%" : "3%" }} />
              </div>
            </div>
          </article>

          <article className="card-panel panelBottom">
            <header className="card-panel-header">
              <p className="card-panel-kicker">
                <LineChart size={14} aria-hidden="true" />
                {t("cards.balanceHistory.title")}
              </p>
            </header>

            <div className="card-panel-body chartBody">
              <p className="metricValue">
                {hasData
                  ? formatCurrency(data?.balanceHistory.at(-1)?.value ?? 0, locale, currencyCode)
                  : loading
                    ? t("states.loadingShort")
                    : formatCurrency(0, locale, currencyCode)}
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

                <div className="chartLabels" aria-hidden="true">
                  {(data?.balanceHistory ?? []).map((point) => (
                    <span key={point.label}>{point.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>

      <style jsx>{`
        .overviewPage {
          min-height: calc(100svh - 94px - 72px);
          padding: var(--padding-card) 0;
          color: var(--foreground);
        }

        .overviewMain {
          width: min(1200px, calc(100% - 24px));
          margin: 0 auto;
          display: grid;
          gap: 1rem;
        }

        .overviewGrid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .panelTop {
          min-height: 286px;
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
          font-size: clamp(1.45rem, 1.18rem + 0.84vw, 1.9rem);
          font-weight: 700;
          color: color-mix(in srgb, var(--foreground) 96%, transparent);
        }

        .creditValue {
          color: color-mix(in srgb, #e44b4b 78%, var(--foreground) 22%);
        }

        .investValue {
          color: color-mix(in srgb, var(--primary) 84%, var(--foreground) 16%);
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
          grid-template-columns: repeat(12, minmax(0, 1fr));
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

        @media (max-width: 1024px) {
          .overviewPage {
            min-height: calc(100svh - 132px - 72px);
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
          .overviewPage {
            min-height: auto;
            padding: calc(var(--padding-card) * 0.9) 0 var(--padding-card);
          }

          .overviewMain {
            width: min(1200px, calc(100% - 40px));
          }

          .chartMock {
            height: 152px;
          }

          .chartLabels {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}