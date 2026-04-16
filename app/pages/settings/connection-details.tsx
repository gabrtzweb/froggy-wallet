"use client";

import { CreditCard, Landmark, TrendingUp, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { InstitutionLogo } from "@/app/components/ui/institution-logo";
import { DetailPageHeader } from "@/app/components/ui/detail-page-header";
import {
  CardPanel,
  CardPanelBody,
  CardPanelHeader,
  CardPanelKicker,
} from "@/app/components/ui/card-panel";
import { resolveInstitutionIdentity } from "@/app/lib/institution-utils";
import { useCachedApi } from "@/app/lib/cached-api";

type ConnectionAccount = {
  id?: string;
  name?: string;
  marketingName?: string | null;
  number?: string;
  maskedNumber?: string;
  balance?: number;
  currencyCode?: string;
  type?: string;
  subtype?: string;
  institutionName?: string | null;
  institutionDomain?: string | null;
  bankData?: {
    transferNumber?: string | null;
  } | null;
  creditData?: {
    creditLimit?: number | null;
    availableCreditLimit?: number | null;
  } | null;
};

type ConnectionInvestment = {
  id?: string;
  name?: string;
  balance?: number;
  currencyCode?: string;
  type?: string;
  status?: string | null;
};

type ConnectionItem = {
  itemId: string;
  item?: {
    updatedAt?: string | null;
    lastUpdatedAt?: string | null;
    connector?: {
      name?: string | null;
      imageUrl?: string | null;
      institutionUrl?: string | null;
    };
  };
  accounts: ConnectionAccount[];
  investments: ConnectionInvestment[];
};

type ConnectionResponse = {
  items?: ConnectionItem[];
  error?: string;
};

function formatUpdatedRelative(dateValue: string | null | undefined, locale: string) {
  if (!dateValue) {
    return locale === "pt-BR" ? "Sem atualizacao" : "No updates";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return locale === "pt-BR" ? "Sem atualizacao" : "No updates";
  }

  const now = Date.now();
  const diffMinutes = Math.round((date.getTime() - now) / (1000 * 60));
  const diffHours = Math.round((date.getTime() - now) / (1000 * 60 * 60));
  const diffDays = Math.round((date.getTime() - now) / (1000 * 60 * 60 * 24));
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  return formatter.format(diffDays, "day");
}

function formatMoney(value: number, formatter: Intl.NumberFormat, currencyCode: string) {
  const formatted = formatter.format(value);

  if (currencyCode === "BRL") {
    return formatted.replace(/^R\$\s*/, "R$ ");
  }

  return formatted;
}

export function SettingsConnectionDetails({ itemId }: { itemId: string }) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const { data, errorMessage, isInitialLoading } = useCachedApi<ConnectionResponse>(
    `/api?endpoint=connections&itemId=${encodeURIComponent(itemId)}`,
  );

  const connection = data?.items?.[0];
  const accounts = connection?.accounts ?? [];
  const investments = connection?.investments ?? [];
  const identity = useMemo(
    () =>
      resolveInstitutionIdentity(
        connection ?? {
          item: { connector: { name: "", institutionUrl: "" } },
          accounts: [],
        },
      ),
    [connection],
  );
  const currencyCode =
    accounts.find((account) => account.currencyCode)?.currencyCode ??
    investments.find((investment) => investment.currencyCode)?.currencyCode ??
    "BRL";
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  });
  const formatCurrency = (value: number) => formatMoney(value, formatter, currencyCode);

  const bankAccounts = accounts.filter((account) => account.type === "BANK" && account.subtype !== "CREDIT_CARD");
  const creditCards = accounts.filter((account) => account.type === "CREDIT" || account.subtype === "CREDIT_CARD");
  const updatedLabel = formatUpdatedRelative(
    connection?.item?.lastUpdatedAt ?? connection?.item?.updatedAt ?? null,
    locale,
  );

  return (
    <div className="app-page">
      <main className="app-page-main app-page-main--grid detailPage">
        <DetailPageHeader
          backHref="/settings"
          backLabel={locale === "pt-BR" ? "Conexões" : "Connections"}
          kicker={t("details.connection.title")}
          title={identity.name || (locale === "pt-BR" ? "Conexão" : "Connection")}
          subtitle={null}
          logo={<InstitutionLogo institutionName={identity.name} institutionDomain={identity.domain} size={56} />}
        />

        {errorMessage ? <p className="statusBanner">{errorMessage}</p> : null}
        {isInitialLoading ? <p className="detailLoading">{locale === "pt-BR" ? "Carregando..." : "Loading..."}</p> : null}

        <section className="detailGrid" aria-label={t("details.connection.title")}>
          <CardPanel className="detailSummaryCard">
            <CardPanelHeader>
              <CardPanelKicker>
                <Landmark size={14} aria-hidden="true" />
                {t("details.connection.summaryTitle")}
              </CardPanelKicker>
            </CardPanelHeader>

            <CardPanelBody>
              <div className="detailFieldGrid">
                <div className="detailField">
                  <span className="detailFieldLabel">{t("details.connection.fields.itemId")}</span>
                  <strong className="detailFieldValue">{itemId}</strong>
                </div>
                <div className="detailField">
                  <span className="detailFieldLabel">{t("details.connection.fields.institution")}</span>
                  <strong className="detailFieldValue">{identity.name || "-"}</strong>
                </div>
                <div className="detailField">
                  <span className="detailFieldLabel">{t("details.connection.fields.updated")}</span>
                  <strong className="detailFieldValue">{updatedLabel}</strong>
                </div>
                <div className="detailField">
                  <span className="detailFieldLabel">{t("details.connection.fields.accounts")}</span>
                  <strong className="detailFieldValue">{bankAccounts.length}</strong>
                </div>
                <div className="detailField">
                  <span className="detailFieldLabel">{t("details.connection.fields.cards")}</span>
                  <strong className="detailFieldValue">{creditCards.length}</strong>
                </div>
                <div className="detailField">
                  <span className="detailFieldLabel">{t("details.connection.fields.investments")}</span>
                  <strong className="detailFieldValue">{investments.length}</strong>
                </div>
              </div>
            </CardPanelBody>
          </CardPanel>

          <CardPanel className="detailListCard">
            <CardPanelHeader>
              <CardPanelKicker>
                <Wallet size={14} aria-hidden="true" />
                {t("details.connection.sections.accounts")}
              </CardPanelKicker>
            </CardPanelHeader>
            <CardPanelBody>
              <div className="detailList">
                {bankAccounts.length ? (
                  bankAccounts.map((account) => (
                    <article key={account.id ?? account.number ?? account.name} className="detailListRow">
                      <div className="detailListMeta">
                        <p className="detailListTitle">{account.marketingName ?? account.name ?? "-"}</p>
                        <p className="detailListSubtitle">{account.number ?? account.maskedNumber ?? ""}</p>
                      </div>
                      <strong className="detailListValue">{formatCurrency(Number(account.balance ?? 0))}</strong>
                    </article>
                  ))
                ) : (
                  <p className="detailEmpty">{t("details.connection.emptyStates.noAccounts")}</p>
                )}
              </div>
            </CardPanelBody>
          </CardPanel>

          <CardPanel className="detailListCard">
            <CardPanelHeader>
              <CardPanelKicker>
                <CreditCard size={14} aria-hidden="true" />
                {t("details.connection.sections.cards")}
              </CardPanelKicker>
            </CardPanelHeader>
            <CardPanelBody>
              <div className="detailList">
                {creditCards.length ? (
                  creditCards.map((account) => (
                    <article key={account.id ?? account.number ?? account.name} className="detailListRow">
                      <div className="detailListMeta">
                        <p className="detailListTitle">{account.marketingName ?? account.name ?? "-"}</p>
                        <p className="detailListSubtitle">{account.number ?? account.maskedNumber ?? ""}</p>
                      </div>
                      <strong className="detailListValue">{formatCurrency(Number(account.balance ?? 0))}</strong>
                    </article>
                  ))
                ) : (
                  <p className="detailEmpty">{t("details.connection.emptyStates.noCards")}</p>
                )}
              </div>
            </CardPanelBody>
          </CardPanel>

          <CardPanel className="detailListCard detailListCardFull">
            <CardPanelHeader>
              <CardPanelKicker>
                <TrendingUp size={14} aria-hidden="true" />
                {t("details.connection.sections.investments")}
              </CardPanelKicker>
            </CardPanelHeader>
            <CardPanelBody>
              <div className="detailList">
                {investments.length ? (
                  investments.map((investment) => (
                    <article key={investment.id ?? investment.name} className="detailListRow">
                      <div className="detailListMeta">
                        <p className="detailListTitle">{investment.name ?? "-"}</p>
                        <p className="detailListSubtitle">{investment.type ?? ""}</p>
                      </div>
                      <strong className="detailListValue">{formatCurrency(Number(investment.balance ?? 0))}</strong>
                    </article>
                  ))
                ) : (
                  <p className="detailEmpty">{t("details.connection.emptyStates.noInvestments")}</p>
                )}
              </div>
            </CardPanelBody>
          </CardPanel>
        </section>
      </main>

      <style>{`
        .detailPage {
          gap: 1rem;
        }

        .detailHero {
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }

        .detailHero .institutionLogo {
          width: 56px;
          height: 56px;
          border-radius: 18px;
        }

        .detailHeroCopy {
          display: grid;
          gap: 0.2rem;
        }

        .detailKicker {
          margin: 0;
          font-size: var(--font-size-sm);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: color-mix(in srgb, var(--foreground) 58%, transparent);
          font-weight: 700;
        }

        .detailHeroCopy h1 {
          margin: 0;
          font-size: var(--font-size-heading);
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .detailSubtitle {
          margin: 0;
          color: color-mix(in srgb, var(--foreground) 70%, transparent);
        }

        .detailLoading {
          margin: 0;
          color: color-mix(in srgb, var(--foreground) 58%, transparent);
          font-size: var(--font-size-sm);
        }

        .detailGrid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 1rem;
        }

        .detailSummaryCard {
          grid-column: 1 / -1;
        }

        .detailListCardFull {
          grid-column: 1 / -1;
        }

        .detailFieldGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .detailField {
          display: grid;
          gap: 0.2rem;
          padding: 0.85rem 0.9rem;
          border-radius: var(--radius-md);
          border: 1px solid color-mix(in srgb, var(--glass-border) 68%, transparent);
          background: color-mix(in srgb, var(--background) 12%, transparent);
        }

        .detailFieldLabel {
          font-size: var(--font-size-sm);
          color: color-mix(in srgb, var(--foreground) 56%, transparent);
        }

        .detailFieldValue {
          font-size: var(--font-size-base);
          color: color-mix(in srgb, var(--foreground) 94%, transparent);
          word-break: break-word;
        }

        .detailList {
          display: grid;
          gap: 0.55rem;
        }

        .detailListRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.9rem;
          padding: 0.8rem 0.9rem;
          border-radius: var(--radius-md);
          border: 1px solid color-mix(in srgb, var(--glass-border) 68%, transparent);
          background: color-mix(in srgb, var(--background) 12%, transparent);
        }

        .detailListMeta {
          display: grid;
          gap: 0.12rem;
          min-width: 0;
        }

        .detailListTitle {
          margin: 0;
          font-weight: 700;
          color: color-mix(in srgb, var(--foreground) 94%, transparent);
        }

        .detailListSubtitle {
          margin: 0;
          font-size: var(--font-size-sm);
          color: color-mix(in srgb, var(--foreground) 56%, transparent);
          word-break: break-word;
        }

        .detailListValue {
          flex-shrink: 0;
          color: var(--primary);
        }

        .detailEmpty {
          margin: 0;
          color: color-mix(in srgb, var(--foreground) 56%, transparent);
          font-size: var(--font-size-sm);
        }

        @media (max-width: 1024px) {
          .detailGrid {
            grid-template-columns: 1fr;
          }

          .detailFieldGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .detailHero {
            align-items: flex-start;
          }

          .detailFieldGrid {
            grid-template-columns: 1fr;
          }

          .detailListRow {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
