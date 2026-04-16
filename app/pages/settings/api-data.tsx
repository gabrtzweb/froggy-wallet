"use client";

import { Copy, Database } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  CardPanel,
  CardPanelBody,
  CardPanelHeader,
  CardPanelKicker,
} from "@/app/components/ui/card-panel";
import { DetailPageHeader } from "@/app/components/ui/detail-page-header";
import { useCachedApi } from "@/app/lib/use-cached-api";

type ApiConnectionsResponse = {
  [key: string]: unknown;
};

export function SettingsApiDataDetails() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const [isCopied, setIsCopied] = useState(false);
  const copyLabel = locale === "pt-BR" ? "Copiar JSON" : "Copy JSON";
  const { data, errorMessage, isInitialLoading } = useCachedApi<ApiConnectionsResponse>("/api?endpoint=connections", {
    keepPreviousData: false,
  });

  const apiSnapshotJson = useMemo(() => {
    if (isInitialLoading) {
      return locale === "pt-BR" ? "Carregando dados da API..." : "Loading API data...";
    }

    if (errorMessage) {
      const errorPayload = {
        error: errorMessage,
      };
      return JSON.stringify(errorPayload, null, 2);
    }

    return JSON.stringify(data ?? {}, null, 2);
  }, [data, errorMessage, isInitialLoading, locale]);

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(apiSnapshotJson);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1600);
    } catch {
      window.alert(locale === "pt-BR" ? "Nao foi possivel copiar o JSON." : "Could not copy JSON.");
    }
  }

  return (
    <div className="app-page">
      <main className="app-page-main app-page-main--grid userDataPage">
        <DetailPageHeader
          backHref="/settings"
          backLabel={locale === "pt-BR" ? "Configuracoes" : "Settings"}
          kicker={t("cards.dataActions.title")}
          title={t("cards.dataActions.viewApiData")}
          logo={(
            <span className="dataEyeLogo" aria-hidden="true">
              <Database size={20} />
            </span>
          )}
        />

        <CardPanel>
          <CardPanelHeader>
            <CardPanelKicker>
              <Database size={14} aria-hidden="true" />
              {t("cards.dataActions.viewApiData")}
            </CardPanelKicker>
          </CardPanelHeader>
          <CardPanelBody>
            <div className="copyJsonRow">
              <p className="copyJsonHelp">
                {locale === "pt-BR"
                  ? "Resumo bruto retornado pela API de conexoes para inspecao rapida."
                  : "Raw payload returned by the connections API for quick inspection."}
              </p>
              <button type="button" className="btn-base btn-card buttonWithIcon copyJsonButton" onClick={handleCopyJson}>
                {isCopied ? (locale === "pt-BR" ? "Copiado!" : "Copied!") : copyLabel}
                <Copy size={14} aria-hidden="true" />
              </button>
            </div>
            <pre className="localJsonViewer">{apiSnapshotJson}</pre>
          </CardPanelBody>
        </CardPanel>
      </main>

      <style>{`
        .userDataPage {
          gap: 1rem;
        }

        .dataEyeLogo {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: var(--btn-text);
          background: linear-gradient(140deg, var(--primary), var(--accent));
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
        }

        .localJsonViewer {
          margin: 0;
          width: 100%;
          min-height: 260px;
          max-height: min(60vh, 560px);
          overflow: auto;
          white-space: pre;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
          font-size: 0.8rem;
          line-height: 1.45;
          padding: 0.9rem;
          border-radius: var(--radius-md);
          border: 1px solid color-mix(in srgb, var(--glass-border) 74%, transparent);
          background: color-mix(in srgb, var(--background) 16%, transparent);
          color: color-mix(in srgb, var(--foreground) 86%, transparent);
        }

        .copyJsonButton {
          font-size: var(--font-size-base);
          min-height: var(--control-height-card);
          font-weight: 700;
        }

        .copyJsonRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          margin-bottom: 0.7rem;
        }

        .copyJsonHelp {
          margin: 0;
          color: color-mix(in srgb, var(--foreground) 64%, transparent);
          font-size: var(--font-size-base);
          line-height: 1.4;
        }

        @media (max-width: 640px) {
          .dataEyeLogo {
            width: 52px;
            height: 52px;
            border-radius: 16px;
          }

          .copyJsonRow {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
