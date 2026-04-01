"use client";

import { OpenFinanceConnect } from "./components/open-finance-connect";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.badge}>
            Froggy Wallet
          </p>
          <h1 className={styles.title}>
            Personal finance dashboard with Pluggy Open Finance integration.
          </h1>
          <p className={styles.description}>
            This page lets you test token generation from your server and launch
            the Pluggy Connect flow in one place.
          </p>
          <div className={styles.actions}>
            <a
              href="/api/connect-token"
              target="_blank"
              rel="noreferrer"
              className={styles.endpointLink}
            >
              Open GET /api/connect-token
            </a>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText("/api/connect-token");
              }}
              className={styles.copyButton}
            >
              Copy POST endpoint
            </button>
          </div>
        </section>

        <OpenFinanceConnect />
      </main>
    </div>
  );
}
