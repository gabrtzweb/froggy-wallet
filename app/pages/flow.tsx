"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/app/components/ui/page-header";

export function Flow() {
  const t = useTranslations("flow");

  return (
    <div className="app-page">
      <main className="app-page-main">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </main>
    </div>
  );
}