"use client";

import {
  ChevronRight,
  Cloud,
  Download,
  Eye,
  Link2,
  Trash2,
  Upload,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { InstitutionLogo } from "@/app/components/institution-logo";
import {
  getInstitutionLogoUrl,
  resolveInstitutionIdentity,
} from "@/app/lib/institution-utils";
import { useCachedApi } from "@/app/lib/use-cached-api";

type RawPluggyAccount = {
  name?: string;
  marketingName?: string | null;
  institutionName?: string | null;
  institutionDomain?: string | null;
  bankData?: {
    transferNumber?: string | null;
  } | null;
};

type RawPluggyItem = {
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
  accounts: RawPluggyAccount[];
};

type RawPluggyResponse = {
  items?: RawPluggyItem[];
  error?: string;
};

type ConnectionSummary = {
  itemId: string;
  name: string;
  domain: string;
  logoUrl: string;
  updatedAt: string | null;
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
  const diffMs = date.getTime() - now;
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  return formatter.format(diffDays, "day");
}

function getConnectionSummary(item: RawPluggyItem): ConnectionSummary {
  const identity = resolveInstitutionIdentity(item);

  return {
    itemId: item.itemId,
    name: identity.name,
    domain: identity.domain,
    logoUrl: getInstitutionLogoUrl(identity.domain),
    updatedAt: item.item?.lastUpdatedAt ?? item.item?.updatedAt ?? null,
  };
}

export function Settings() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const { data, errorMessage, isInitialLoading } = useCachedApi<RawPluggyResponse>(
    "/api/debug/pluggy",
  );

  const connections = useMemo(() => {
    const items = data?.items ?? [];
    return items.map(getConnectionSummary);
  }, [data]);
  const connectionsError = errorMessage;
  const showFirstLoadState = isInitialLoading;
  const loadingConnectionsLabel = locale === "pt-BR" ? "Carregando conexoes..." : "Loading connections...";

  const desktopSlots = useMemo(() => {
    const cards = connections.map((connection) => ({
      type: "connection" as const,
      connection,
    }));

    const placeholders = Array.from({ length: Math.max(0, 4 - cards.length) }).map((_, index) => ({
      type: "placeholder" as const,
      id: `placeholder-${index + 1}`,
    }));

    return [...cards, ...placeholders];
  }, [connections]);

  return (
    <div className="app-page">
      <main className="app-page-main app-page-main--grid">
        <header className="page-header-block">
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </header>

        <section className="layoutGrid" aria-label={t("title")}>
          <article className="card-panel panelWide">
            <header className="card-panel-header">
              <p className="card-panel-kicker">
                <UserCircle2 size={14} aria-hidden="true" />
                {t("cards.userData.title")}
              </p>
            </header>

            <div className="card-panel-body userBody">
              <div className="profileRow">
                <span className="account-avatar">RG</span>
                <div className="nameField input-like-base">Rodrigo</div>
              </div>

              <p className="helperText content-sm">{t("cards.userData.imageHint")}</p>

              <div className="sectionLink content-sm" role="button" tabIndex={0}>
                <span>{t("cards.userData.userInfo")}</span>
                <ChevronRight size={14} aria-hidden="true" />
              </div>
            </div>
          </article>

          <article className="card-panel panelNarrow">
            <header className="card-panel-header">
              <p className="card-panel-kicker">
                <Cloud size={14} aria-hidden="true" />
                {t("cards.dataActions.title")}
              </p>
            </header>

            <div className="card-panel-body">
              <p className="card-panel-description">{t("cards.dataActions.subtitle")}</p>

              <div className="actionsGrid">
                <Link href="/debug/pluggy" className="card-btn-outline btn-sm-outline">
                  <Eye size={14} aria-hidden="true" />
                  {t("cards.dataActions.view")}
                </Link>
                <button type="button" className="card-btn-outline btn-sm-outline">
                  <Trash2 size={14} aria-hidden="true" />
                  {t("cards.dataActions.remove")}
                </button>
                <button type="button" className="card-btn-outline btn-sm-outline">
                  <Download size={14} aria-hidden="true" />
                  {t("cards.dataActions.export")}
                </button>
                <button type="button" className="card-btn-outline btn-sm-outline">
                  <Upload size={14} aria-hidden="true" />
                  {t("cards.dataActions.import")}
                </button>
              </div>
            </div>
          </article>

          <article className="card-panel panelFull">
            <header className="card-panel-header">
              <p className="card-panel-kicker">
                <Link2 size={14} aria-hidden="true" />
                {t("cards.connections.title")}
              </p>
            </header>

            <div className="card-panel-body">
              {connectionsError ? <p className="connectionError">{connectionsError}</p> : null}
              {showFirstLoadState ? <p className="connectionLoading">{loadingConnectionsLabel}</p> : null}
              <div className="connectionGrid">
                {desktopSlots.map((slot) => {
                  if (slot.type === "placeholder") {
                    return <article key={slot.id} className="connectionCard placeholder" aria-hidden="true" />;
                  }

                  const connection = slot.connection;
                  const updatedLabel = formatUpdatedRelative(connection.updatedAt, locale);

                  return (
                    <article key={connection.itemId} className="connectionCard">
                      <div className="connectionTopRow">
                        <InstitutionLogo institutionName={connection.name} institutionDomain={connection.domain} small />
                        <span className="connectionPulse" aria-hidden="true" />
                      </div>

                      <div className="connectionMeta">
                        <p className="connectionName">{connection.name}</p>
                        <p className="connectionUpdated">{updatedLabel}</p>
                        <p className="connectionItemId">{connection.itemId}</p>
                      </div>

                      <div className="divider-bottom connectionDivider" aria-hidden="true" />

                      <div className="sectionLink content-sm connectionDetails" role="button" tabIndex={0}>
                        <span>{t("cards.connections.sample.details")}</span>
                        <ChevronRight size={14} aria-hidden="true" />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </article>
        </section>
      </main>

      <style jsx>{`
        .layoutGrid {
          display: grid;
          grid-template-columns: 1.95fr 1fr;
          gap: 1rem;
        }

        .panelWide {
          min-height: 178px;
        }

        .panelNarrow {
          min-height: 178px;
        }

        .panelFull {
          grid-column: 1 / -1;
          min-height: 238px;
        }

        .userBody {
          display: grid;
          gap: 0.95rem;
        }

        .profileRow {
          display: flex;
          align-items: center;
          gap: 0.62rem;
        }

        .nameField {
          min-width: 220px;
          max-width: 280px;
        }

        .helperText {
          margin: 0;
          color: color-mix(in srgb, var(--foreground) 56%, transparent);
        }

        .sectionLink {
          border-top: 1px solid color-mix(in srgb, var(--divider) 76%, transparent);
          padding-top: 0.72rem;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          width: fill;
          color: color-mix(in srgb, var(--foreground) 62%, transparent);
          font-weight: 600;
          font-size: var(--font-size-sm);
          cursor: default;
        }

        .actionsGrid {
          margin-top: 0.72rem;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.55rem;
        }

        .connectionGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.8rem;
          min-height: 186px;
        }

        .connectionError {
          padding-bottom: 0.68rem;
          color: color-mix(in srgb, #e44b4b 85%, var(--foreground) 15%);
          font-size: var(--font-size-sm);
        }

        .connectionLoading {
          margin: 0;
          padding-bottom: 0.68rem;
          color: color-mix(in srgb, var(--foreground) 58%, transparent);
          font-size: var(--font-size-sm);
        }

        .connectionCard {
          border: 1px solid color-mix(in srgb, var(--glass-border) 66%, transparent);
          border-radius: var(--radius-md);
          background:
            linear-gradient(
              160deg,
              color-mix(in srgb, var(--background) 87%, transparent),
              color-mix(in srgb, var(--glass-bg) 64%, transparent)
            );
          min-height: 172px;
          padding: var(--card-body-padding);
          display: grid;
          grid-template-rows: auto 1fr auto auto;
          gap: 0.6rem;
        }

        .connectionCard.placeholder {
          border-style: dashed;
          background: color-mix(in srgb, var(--background) 15%, transparent);
        }

        .connectionTopRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .connectionPulse {
          display: inline-block;
          flex-shrink: 0;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--primary) 72%, transparent);
          box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 38%, transparent);
          animation: pulse 1.8s ease-out infinite;
        }

        .connectionMeta {
          display: grid;
          gap: 0.24rem;
        }

        .connectionName {
          margin: 0;
          font-size: var(--font-size-base);
          font-weight: 700;
          color: color-mix(in srgb, var(--foreground) 92%, transparent);
        }

        .connectionUpdated {
          margin: 0;
          font-size: var(--font-size-sm);
          color: color-mix(in srgb, var(--foreground) 56%, transparent);
        }

        .connectionItemId {
          margin: 0;
          font-size: var(--font-size-sm);
          color: color-mix(in srgb, var(--foreground) 44%, transparent);
          word-break: break-all;
        }

        .connectionDivider {
          padding: 0;
        }

        .connectionDetails {
          width: 100%;
          gap: 0.3rem;
          border-top: 0;
          padding-top: 0;
          color: color-mix(in srgb, var(--foreground) 62%, transparent);
          cursor: default;
        }

        @media (max-width: 1024px) {
          .layoutGrid {
            grid-template-columns: 1fr;
          }

          .connectionGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .actionsGrid {
            grid-template-columns: 1fr;
          }

          .connectionGrid {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .connectionCard.placeholder {
            display: none;
          }

          .nameField {
            min-width: 0;
            width: 100%;
          }

          .profileRow {
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}