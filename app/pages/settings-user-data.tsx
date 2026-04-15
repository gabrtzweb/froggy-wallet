"use client";

import { Copy, Eye } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  CardPanel,
  CardPanelBody,
  CardPanelHeader,
  CardPanelKicker,
} from "@/app/components/ui/card-panel";
import { DetailPageHeader } from "@/app/components/ui/detail-page-header";
import { LOCAL_DATA_UPDATED_EVENT, readAppLocalDataFromStorage } from "@/app/lib/local-data";
import { PROFILE_UPDATED_EVENT } from "@/app/lib/profile-storage";

export function SettingsUserDataDetails() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const [localSnapshot, setLocalSnapshot] = useState(() => readAppLocalDataFromStorage());
  const [isCopied, setIsCopied] = useState(false);
  const copyLabel = locale === "pt-BR" ? "Copiar JSON" : "Copy JSON";

  useEffect(() => {
    function refreshSnapshot() {
      setLocalSnapshot(readAppLocalDataFromStorage());
    }

    refreshSnapshot();
    window.addEventListener("storage", refreshSnapshot);
    window.addEventListener(PROFILE_UPDATED_EVENT, refreshSnapshot as EventListener);
    window.addEventListener(LOCAL_DATA_UPDATED_EVENT, refreshSnapshot as EventListener);

    return () => {
      window.removeEventListener("storage", refreshSnapshot);
      window.removeEventListener(PROFILE_UPDATED_EVENT, refreshSnapshot as EventListener);
      window.removeEventListener(LOCAL_DATA_UPDATED_EVENT, refreshSnapshot as EventListener);
    };
  }, []);

  const localSnapshotJson = useMemo(() => {
    return JSON.stringify(localSnapshot, null, 2);
  }, [localSnapshot]);

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(localSnapshotJson);
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
          kicker={t("details.userData.title")}
          title={t("details.userData.informationTitle")}
          logo={(
            <span className="dataEyeLogo" aria-hidden="true">
              <Eye size={20} />
            </span>
          )}
        />

        <CardPanel>
          <CardPanelHeader>
            <CardPanelKicker>
              <Eye size={14} aria-hidden="true" />
              {t("details.userData.sections.savedJson")}
            </CardPanelKicker>
          </CardPanelHeader>
          <CardPanelBody>
            <div className="copyJsonRow">
              <p className="copyJsonHelp">
                {locale === "pt-BR"
                  ? "Visualize e copie rapidamente o JSON local salvo no seu navegador."
                  : "Quickly view and copy the local JSON data saved in your browser."}
              </p>
              <button type="button" className="btn-base btn-card buttonWithIcon copyJsonButton" onClick={handleCopyJson}>
                {isCopied ? (locale === "pt-BR" ? "Copiado!" : "Copied!") : copyLabel}
                <Copy size={14} aria-hidden="true" />
              </button>
            </div>
            <pre className="localJsonViewer">{localSnapshotJson}</pre>
          </CardPanelBody>
        </CardPanel>
      </main>

      <style jsx global>{`
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
