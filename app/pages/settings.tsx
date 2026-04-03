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
import { useTranslations } from "next-intl";

export function Settings() {
  const t = useTranslations("settings");

  return (
    <div className="settingsPage">
      <main className="settingsMain">
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
                <button type="button" className="card-btn-outline btn-sm-outline">
                  <Eye size={14} aria-hidden="true" />
                  {t("cards.dataActions.view")}
                </button>
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
              <div className="connectionGrid">
                <article className="connectionCard" aria-hidden="true" />
                <article className="connectionCard" aria-hidden="true" />
                <article className="connectionCard" aria-hidden="true" />
                <article className="connectionCard" aria-hidden="true" />
              </div>
            </div>
          </article>
        </section>
      </main>

      <style jsx>{`
        .settingsPage {
          min-height: calc(100svh - 94px - 72px);
          padding: var(--padding-card) 0;
          color: var(--foreground);
        }

        .settingsMain {
          width: min(1200px, calc(100% - 24px));
          margin: 0 auto;
          display: grid;
          gap: 1rem;
        }

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
          line-height: 1.5;
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

        .connectionCard {
          border: 1px dashed color-mix(in srgb, var(--glass-border) 70%, transparent);
          border-radius: 13px;
          background: color-mix(in srgb, var(--background) 15%, transparent);
          min-height: 168px;
        }

        @media (max-width: 1024px) {
          .settingsPage {
            min-height: calc(100svh - 132px - 72px);
          }

          .layoutGrid {
            grid-template-columns: 1fr;
          }

          .connectionGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .settingsPage {
            min-height: auto;
            padding: calc(var(--padding-card) * 0.9) 0 var(--padding-card);
          }

          .settingsMain {
            width: min(1200px, calc(100% - 40px));
          }

          .actionsGrid {
            grid-template-columns: 1fr;
          }

          .connectionGrid {
            grid-template-columns: 1fr;
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