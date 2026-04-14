"use client";

import { useTranslations } from "next-intl";
import { DashboardUnavailableCard } from "@/app/components/ui/dashboard-unavailable";
import { PageHeader } from "@/app/components/ui/page-header";

type PlanningProps = {
  isPluggyAvailable?: boolean;
};

export function Planning({ isPluggyAvailable = true }: PlanningProps) {
  const t = useTranslations("planning");

  if (!isPluggyAvailable) {
    return <DashboardUnavailableCard />;
  }

  return (
    <div className="app-page">
      <main className="app-page-main">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </main>
    </div>
  );
}