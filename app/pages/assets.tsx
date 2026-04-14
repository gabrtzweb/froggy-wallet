"use client";

import { useTranslations } from "next-intl";
import { DashboardUnavailableCard } from "@/app/components/ui/dashboard-unavailable";
import { PageHeader } from "@/app/components/ui/page-header";

type ResourcesProps = {
  isPluggyAvailable?: boolean;
};

export function Resources({ isPluggyAvailable = true }: ResourcesProps) {
  const t = useTranslations("resources");

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