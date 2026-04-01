"use client";

import { useTranslations } from "next-intl";
import { OpenFinanceConnect } from "../components/open-finance-connect";
import styles from "../styles/api-page.module.css";

export function ApiPage() {
  const t = useTranslations("apiPage");

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={`${styles.hero} glass-panel`}>
          <div className="cardHeader">
            <h1 className="card-title">{t("hero.title")}</h1>
            <p className="card-subtitle">{t("hero.subtitle")}</p>
          </div>
          <div className="cardContent">
            <div className={styles.actions}>
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

        <OpenFinanceConnect />
      </main>
    </div>
  );
}
