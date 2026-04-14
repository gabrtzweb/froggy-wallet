"use client";

import { CalendarDays, IdCard, Mail, MapPin, Phone, UserCircle2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  CardPanel,
  CardPanelBody,
  CardPanelHeader,
  CardPanelKicker,
} from "@/app/components/ui/card-panel";
import { DetailPageHeader } from "@/app/components/ui/detail-page-header";
import { createProfileInitials, useProfileName } from "@/app/lib/profile-client";

type PlaceholderField = {
  label: string;
  value: string;
  icon: ReactNode;
};

function DetailField({ label, value, icon }: PlaceholderField) {
  return (
    <div className="detailField detailField--compact">
      <span className="detailFieldLabel">
        {icon}
        {label}
      </span>
      <strong className="detailFieldValue">{value}</strong>
    </div>
  );
}

export function SettingsUserInformationDetails() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const placeholder = t("details.userInformation.placeholder");
  const fallbackName = t("details.userInformation.fallbackName");
  const displayName = useProfileName(fallbackName);

  return (
    <div className="app-page">
      <main className="app-page-main app-page-main--grid detailPage">
        <DetailPageHeader
          backHref="/settings"
          backLabel={locale === "pt-BR" ? "Configurações" : "Settings"}
          kicker={t("details.userInformation.title")}
          title={displayName}
          subtitle={null}
          logo={<span className="profileLogo" aria-hidden="true">{createProfileInitials(displayName)}</span>}
        />

        <CardPanel className="detailSummaryCard">
          <CardPanelHeader>
            <CardPanelKicker>
              <UserCircle2 size={14} aria-hidden="true" />
              {t("details.userInformation.profileSectionTitle")}
            </CardPanelKicker>
          </CardPanelHeader>
          <CardPanelBody>
            <div className="detailFieldGrid detailFieldGrid--profile">
              <DetailField
                label={t("details.userInformation.fields.name")}
                value={placeholder}
                icon={<UserCircle2 size={13} aria-hidden="true" />}
              />
              <DetailField
                label={t("details.userInformation.fields.idDocument")}
                value={placeholder}
                icon={<IdCard size={13} aria-hidden="true" />}
              />
              <DetailField
                label={t("details.userInformation.fields.birthDate")}
                value={placeholder}
                icon={<CalendarDays size={13} aria-hidden="true" />}
              />
              <DetailField
                label={t("details.userInformation.fields.email")}
                value={placeholder}
                icon={<Mail size={13} aria-hidden="true" />}
              />
              <DetailField
                label={t("details.userInformation.fields.phone")}
                value={placeholder}
                icon={<Phone size={13} aria-hidden="true" />}
              />
              <DetailField
                label={t("details.userInformation.fields.address")}
                value={placeholder}
                icon={<MapPin size={13} aria-hidden="true" />}
              />
            </div>
          </CardPanelBody>
        </CardPanel>
      </main>

      <style jsx global>{`
        .detailPage {
          gap: 1rem;
        }

        .profileLogo {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--btn-text);
          background: linear-gradient(140deg, var(--primary), var(--accent));
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
        }

        .detailSummaryCard {
          width: 100%;
        }

        .detailFieldGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.6rem;
        }

        .detailFieldGrid--profile {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .detailField {
          display: grid;
          gap: 0.15rem;
          padding: 0.68rem 0.76rem;
          border-radius: var(--radius-md);
          border: 1px solid color-mix(in srgb, var(--glass-border) 68%, transparent);
          background: color-mix(in srgb, var(--background) 12%, transparent);
        }

        .detailField--compact {
          min-height: 80px;
        }

        .detailFieldLabel {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: var(--font-size-sm);
          color: color-mix(in srgb, var(--foreground) 56%, transparent);
        }

        .detailFieldValue {
          font-size: var(--font-size-base);
          color: color-mix(in srgb, var(--foreground) 94%, transparent);
          word-break: break-word;
        }

        @media (max-width: 1024px) {
          .detailFieldGrid,
          .detailFieldGrid--profile {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .detailHero {
            align-items: flex-start;
          }

          .profileLogo {
            width: 52px;
            height: 52px;
            border-radius: 16px;
          }

          .detailFieldGrid,
          .detailFieldGrid--profile {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
