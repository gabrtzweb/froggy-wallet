"use client";

import { useTranslations } from "next-intl";

export function Planning() {
  const t = useTranslations("planning");

  return (
    <div className="app-page">
      <main className="app-page-main">
        <header className="page-header-block">
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </header>
      </main>
    </div>
  );
}