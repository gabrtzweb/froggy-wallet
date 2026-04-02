"use client";

import { useTranslations } from "next-intl";
import { PluggyConnect } from "../components/pluggy-connect";

export function ApiGuide() {
  const t = useTranslations("apiPage");

  return (
    <div className="page">
      <main className="main">
        <section className="hero glass-panel">
          <div className="cardHeader">
            <h1 className="card-title">{t("hero.title")}</h1>
            <p className="card-subtitle">{t("hero.subtitle")}</p>
          </div>
          <div className="cardContent">
            <div className="actions">
              <a
                href="/api/connect-token"
                target="_blank"
                rel="noreferrer"
                className="btn-base btn-secondary"
              >
                {t("hero.buttons.getEndpoint")}
              </a>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText("/api/connect-token");
                }}
                className="btn-base btn-primary"
              >
                {t("hero.buttons.copyEndpoint")}
              </button>
            </div>
          </div>
        </section>

        <PluggyConnect />
      </main>

      <style jsx>{`
        .page {
          min-height: auto;
          padding: var(--padding-card) 0;
          color: var(--foreground);
        }

        .main {
          width: min(1200px, calc(100% - 24px));
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .hero {
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        @media (max-width: 640px) {
          .page {
            padding: calc(var(--padding-card) * 0.7) 0;
          }

          .main {
            width: min(1200px, calc(100% - 16px));
          }
        }
      `}</style>
    </div>
  );
}