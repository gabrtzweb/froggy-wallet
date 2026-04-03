"use client";

import { useTranslations } from "next-intl";

export function Flow() {
  const t = useTranslations("flow");

  return (
    <div className="simplePage">
      <main className="simpleMain">
        <header className="page-header-block">
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </header>
      </main>

      <style jsx>{`
        .simplePage {
          min-height: calc(100svh - 94px - 72px);
          padding: var(--padding-card) 0;
          color: var(--foreground);
        }

        .simpleMain {
          width: min(1200px, calc(100% - 24px));
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .simplePage {
            min-height: calc(100svh - 132px - 72px);
          }
        }

        @media (max-width: 640px) {
          .simplePage {
            min-height: auto;
            padding: calc(var(--padding-card) * 0.9) 0 var(--padding-card);
          }

          .simpleMain {
            width: min(1200px, calc(100% - 40px));
          }
        }
      `}</style>
    </div>
  );
}