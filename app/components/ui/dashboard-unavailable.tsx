"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function DashboardUnavailableCard() {
  const t = useTranslations("globalStates.dashboardUnavailable");

  return (
    <div className="app-page app-page--centered">
      <main className="app-page-main unavailablePageMain">
        <section className="dashboardUnavailableCard" aria-live="polite" role="status">
          <h2>{t("title")}</h2>
          <p>{t("description")}</p>
          <Link href="/settings" className="btn-base btn-primary buttonWithIcon"> 
            {t("action")}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </main>
    </div>
  );
}
