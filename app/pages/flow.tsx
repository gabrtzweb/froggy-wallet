"use client";

import { useTranslations } from "next-intl";
import { DashboardUnavailableCard } from "@/app/components/ui/dashboard-unavailable";
import { PageHeader } from "@/app/components/ui/page-header";

type FlowProps = {
  isPluggyAvailable?: boolean;
};

export function Flow({ isPluggyAvailable = true }: FlowProps) {
  const t = useTranslations("flow");

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