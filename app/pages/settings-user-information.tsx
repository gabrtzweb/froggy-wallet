"use client";

import { CalendarDays, IdCard, Mail, MapPin, Phone, UserCircle2 } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  CardPanel,
  CardPanelBody,
  CardPanelHeader,
  CardPanelKicker,
} from "@/app/components/ui/card-panel";
import { DetailPageHeader } from "@/app/components/ui/detail-page-header";
import { createProfileInitials, useProfileImageDataUrl, useProfileName } from "@/app/lib/profile-client";
import { useCachedApi } from "@/app/lib/use-cached-api";

type UserInformationResponse = {
  fullName: string | null;
  documentId: string | null;
  birthDate: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

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

function formatBirthDateForDisplay(value: string, placeholder: string) {
  if (!value) {
    return placeholder;
  }

  const dateParts = value.split("-").map((part) => Number(part));
  if (dateParts.length !== 3 || dateParts.some((part) => !Number.isInteger(part))) {
    return placeholder;
  }

  const [year, month, day] = dateParts;
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) {
    return placeholder;
  }

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${String(year).padStart(4, "0")}`;
}

function formatPhoneForDisplay(value: string, placeholder: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return placeholder;
  }

  if (digits.length <= 4) {
    return digits;
  }

  return `${digits.slice(0, -4)}-${digits.slice(-4)}`;
}

export function SettingsUserInformationDetails() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const placeholder = t("details.userInformation.placeholder");
  const fallbackName = t("details.userInformation.fallbackName");
  const { data } = useCachedApi<UserInformationResponse>("/api?endpoint=user-information");
  const apiFullName = data?.fullName?.trim() ?? "";
  const apiDocumentId = data?.documentId?.trim() ?? "";
  const apiBirthDate = data?.birthDate?.trim() ?? "";
  const apiEmail = data?.email?.trim() ?? "";
  const apiPhone = data?.phone?.trim() ?? "";
  const apiAddress = data?.address?.trim() ?? "";
  const displayName = useProfileName(fallbackName);
  const profileImageDataUrl = useProfileImageDataUrl();
  const fullName = apiFullName || placeholder;
  const documentId = apiDocumentId || placeholder;
  const birthDate = formatBirthDateForDisplay(apiBirthDate, placeholder);
  const email = apiEmail || placeholder;
  const phone = formatPhoneForDisplay(apiPhone, placeholder);
  const address = apiAddress || placeholder;

  return (
    <div className="app-page">
      <main className="app-page-main app-page-main--grid detailPage">
        <DetailPageHeader
          backHref="/settings"
          backLabel={locale === "pt-BR" ? "Configurações" : "Settings"}
          kicker={t("details.userInformation.title")}
          title={displayName}
          subtitle={null}
          logo={(
            <span className="profileLogo" aria-hidden="true">
              {profileImageDataUrl ? (
                <Image
                  src={profileImageDataUrl}
                  alt=""
                  width={56}
                  height={56}
                  unoptimized
                  className="profileLogoImage"
                  aria-hidden="true"
                />
              ) : (
                createProfileInitials(displayName)
              )}
            </span>
          )}
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
                value={fullName}
                icon={<UserCircle2 size={13} aria-hidden="true" />}
              />
              <DetailField
                label={t("details.userInformation.fields.idDocument")}
                value={documentId}
                icon={<IdCard size={13} aria-hidden="true" />}
              />
              <DetailField
                label={t("details.userInformation.fields.birthDate")}
                value={birthDate}
                icon={<CalendarDays size={13} aria-hidden="true" />}
              />
              <DetailField
                label={t("details.userInformation.fields.email")}
                value={email}
                icon={<Mail size={13} aria-hidden="true" />}
              />
              <DetailField
                label={t("details.userInformation.fields.phone")}
                value={phone}
                icon={<Phone size={13} aria-hidden="true" />}
              />
              <DetailField
                label={t("details.userInformation.fields.address")}
                value={address}
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
          overflow: hidden;
        }

        .profileLogoImage {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
