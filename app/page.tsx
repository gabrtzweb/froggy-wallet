"use client";

import { useTranslations } from "next-intl";
import { OpenFinanceConnect } from "./components/open-finance-connect";
import styles from "./page.module.css";

export default function Home() {
  const t = useTranslations();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={`${styles.hero} glass-panel`}>
          <div className="cardHeader">
            <h1 className="card-title">{t("home.hero.title")}</h1>
            <p className="card-subtitle">{t("home.hero.subtitle")}</p>
          </div>
          <div className="cardContent">
            <div className={styles.actions}>
              <a
                href="/api/connect-token"
                target="_blank"
                rel="noreferrer"
                className="btn-base btn-secondary"
              >
                {t("home.hero.buttons.getEndpoint")}
              </a>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText("/api/connect-token");
                }}
                className="btn-base btn-primary"
              >
                {t("home.hero.buttons.copyEndpoint")}
              </button>
            </div>
          </div>
        </section>

        <OpenFinanceConnect />
      </main>
    </div>
  );
}
