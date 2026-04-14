"use client";

import {
  Copy,
  Clock3,
  Cloud,
  Download,
  Eye,
  EyeOff,
  Link2,
  Plus,
  Pencil,
  Trash2,
  Upload,
  UserCircle2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState, type FormEvent } from "react";
import { InstitutionLogo } from "@/app/components/institution-logo";
import { CardAction } from "@/app/components/ui/card-action";
import {
  CardPanel,
  CardPanelBody,
  CardPanelHeader,
  CardPanelKicker,
} from "@/app/components/ui/card-panel";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionLink } from "@/app/components/ui/section-link";
import {
  getInstitutionLogoUrl,
  resolveInstitutionIdentity,
} from "@/app/lib/institution-utils";
import { createProfileInitials, persistProfileName, useProfileName } from "@/app/lib/profile-client";
import { useCachedApi } from "@/app/lib/use-cached-api";

type RawPluggyAccount = {
  name?: string;
  marketingName?: string | null;
  institutionName?: string | null;
  institutionDomain?: string | null;
  bankData?: {
    transferNumber?: string | null;
  } | null;
};

type RawPluggyItem = {
  itemId: string;
  item?: {
    updatedAt?: string | null;
    lastUpdatedAt?: string | null;
    connector?: {
      name?: string | null;
      imageUrl?: string | null;
      institutionUrl?: string | null;
    };
  };
  accounts: RawPluggyAccount[];
};

type RawPluggyResponse = {
  items?: RawPluggyItem[];
  error?: string;
};

type ConnectionSummary = {
  itemId: string;
  name: string;
  domain: string;
  logoUrl: string;
  updatedAt: string | null;
};

type ConnectionFormState = {
  clientId: string;
  clientSecret: string;
  itemIds: string;
};

function formatUpdatedRelative(dateValue: string | null | undefined, locale: string) {
  if (!dateValue) {
    return locale === "pt-BR" ? "Sem atualizacao" : "No updates";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return locale === "pt-BR" ? "Sem atualizacao" : "No updates";
  }

  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  return formatter.format(diffDays, "day");
}

function getConnectionSummary(item: RawPluggyItem): ConnectionSummary {
  const identity = resolveInstitutionIdentity(item);

  return {
    itemId: item.itemId,
    name: identity.name,
    domain: identity.domain,
    logoUrl: getInstitutionLogoUrl(identity.domain),
    updatedAt: item.item?.lastUpdatedAt ?? item.item?.updatedAt ?? null,
  };
}

export function Settings() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const fallbackName = t("details.userInformation.fallbackName");
  const { data, errorMessage, isInitialLoading } = useCachedApi<RawPluggyResponse>(
    "/api/debug/pluggy",
  );
  const savedName = useProfileName(fallbackName);
  const [draftName, setDraftName] = useState(savedName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [connectionForm, setConnectionForm] = useState<ConnectionFormState>({
    clientId: "",
    clientSecret: "",
    itemIds: "",
  });

  const connections = useMemo(() => {
    const items = data?.items ?? [];
    return items.map(getConnectionSummary);
  }, [data]);
  const connectionsError = errorMessage;
  const showFirstLoadState = isInitialLoading;
  const loadingConnectionsLabel = locale === "pt-BR" ? "Carregando conexoes..." : "Loading connections...";
  const trimmedSavedName = savedName.trim();
  const trimmedDraftName = draftName.trim();
  const hasNameChanges = isEditingName && Boolean(trimmedDraftName) && trimmedDraftName !== trimmedSavedName;
  const visibleName = isEditingName ? draftName : savedName;
  const profileNameForInitials = isEditingName ? trimmedDraftName : trimmedSavedName;
  const profileInitials = createProfileInitials(profileNameForInitials || fallbackName);

  function handleNameSave() {
    if (!hasNameChanges) {
      return;
    }

    persistProfileName(trimmedDraftName);
    setDraftName(trimmedDraftName);
    setIsEditingName(false);
  }

  function openConnectionModal() {
    setIsConnectionModalOpen(true);
  }

  function closeConnectionModal() {
    setIsConnectionModalOpen(false);
    setShowClientSecret(false);
  }

  function handleConnectionFieldChange(field: keyof ConnectionFormState, value: string) {
    setConnectionForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleConnectionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    closeConnectionModal();
  }

  const desktopSlots = useMemo(() => {
    const cards = connections.map((connection) => ({
      type: "connection" as const,
      connection,
    }));

    const placeholders = Array.from({ length: Math.max(0, 4 - cards.length) }).map((_, index) => ({
      type: "placeholder" as const,
      id: `placeholder-${index + 1}`,
    }));

    return [...cards, ...placeholders];
  }, [connections]);

  return (
    <div className="app-page">
      <main className="app-page-main app-page-main--grid">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />

        <section className="layoutGrid" aria-label={t("title")}>
          <CardPanel className="panelWide">
            <CardPanelHeader>
              <CardPanelKicker>
                <UserCircle2 size={14} aria-hidden="true" />
                {t("cards.userData.title")}
              </CardPanelKicker>
            </CardPanelHeader>

            <CardPanelBody className="userBody">
              <div className="profileRow">
                <button type="button" className="avatarEditButton" aria-label={t("details.userInformation.profileImageHint")}>
                  <span className="account-avatar">{profileInitials}</span>
                  <span className="avatarEditOverlay" aria-hidden="true">
                    <Pencil size={11} />
                  </span>
                </button>

                <div className={`nameFieldWrap ${isEditingName ? "isEditing" : ""}`}>
                  {isEditingName ? (
                    <input
                      className="nameInput input-like-base"
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      onBlur={() => {
                        setDraftName(savedName);
                        setIsEditingName(false);
                      }}
                      autoFocus
                      aria-label={t("details.userInformation.fields.name")}
                    />
                  ) : (
                    <button
                      type="button"
                      className="nameField input-like-base"
                      onClick={() => {
                        setDraftName(savedName);
                        setIsEditingName(true);
                      }}
                    >
                      <span>{visibleName}</span>
                    </button>
                  )}

                  <span className="nameEditOverlay" aria-hidden="true">
                    <Pencil size={12} />
                  </span>
                </div>

                <span className="saveNameSlot" aria-hidden={!hasNameChanges}>
                  {hasNameChanges ? (
                    <button
                      type="button"
                      className="btn-base btn-card saveNameButton"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={handleNameSave}
                    >
                      {t("details.userInformation.save")}
                    </button>
                  ) : null}
                </span>
              </div>

              <p className="helperText content-sm">{t("cards.userData.imageHint")}</p>

              <div className="divider-bottom userDivider" aria-hidden="true" />

              <SectionLink href="/settings/user-information" label={t("cards.userData.userInfo")} />
            </CardPanelBody>
          </CardPanel>

          <CardPanel className="panelNarrow">
            <CardPanelHeader>
              <CardPanelKicker>
                <Cloud size={14} aria-hidden="true" />
                {t("cards.dataActions.title")}
              </CardPanelKicker>
            </CardPanelHeader>

            <CardPanelBody>
              <div className="actionsGrid">
                <CardAction href="/api/debug/pluggy">
                  {t("cards.dataActions.view")}
                  <Eye size={14} aria-hidden="true" />
                </CardAction>
                <CardAction>
                  {t("cards.dataActions.remove")}
                  <Trash2 size={14} aria-hidden="true" />
                </CardAction>
                <CardAction>
                  {t("cards.dataActions.export")}
                  <Download size={14} aria-hidden="true" />
                </CardAction>
                <CardAction>
                  {t("cards.dataActions.import")}
                  <Upload size={14} aria-hidden="true" />
                </CardAction>
              </div>
            </CardPanelBody>
          </CardPanel>

          <CardPanel className="panelFull">
            <CardPanelHeader>
              <CardPanelKicker>
                <Link2 size={14} aria-hidden="true" />
                {t("cards.connections.title")}
              </CardPanelKicker>
            </CardPanelHeader>

            <CardPanelBody>
              <div className="connectionsToolbar">
                <button type="button" className="btn-base btn-card buttonWithIcon" onClick={openConnectionModal}>
                  {t("cards.connections.newConnection")}
                  <Plus size={14} aria-hidden="true" />
                </button>
                <p className="connectionsCount">{t("cards.connections.activeCount", { count: connections.length })}</p>
              </div>

              {connectionsError ? <p className="connectionError">{connectionsError}</p> : null}
              {showFirstLoadState ? <p className="connectionLoading">{loadingConnectionsLabel}</p> : null}
              <div className="connectionGrid">
                {desktopSlots.map((slot) => {
                  if (slot.type === "placeholder") {
                    return <article key={slot.id} className="connectionCard placeholder" aria-hidden="true" />;
                  }

                  const connection = slot.connection;
                  const updatedLabel = formatUpdatedRelative(connection.updatedAt, locale);

                  return (
                    <article key={connection.itemId} className="connectionCard">
                      <div className="connectionTopRow">
                        <InstitutionLogo institutionName={connection.name} institutionDomain={connection.domain} />
                        <span className="connectionPulse" aria-hidden="true" />
                      </div>

                      <div className="connectionMeta">
                        <p className="connectionName">{connection.name}</p>
                        <p className="connectionUpdated">
                          <Clock3 size={12} aria-hidden="true" />
                          <span>{updatedLabel}</span>
                        </p>
                        <p className="connectionItemId">{connection.itemId}</p>
                      </div>

                      <div className="divider-bottom connectionDivider" aria-hidden="true" />

                      <SectionLink
                        href={`/settings/connections/${connection.itemId}`}
                        label={t("cards.connections.sample.details")}
                        className="connectionDetails"
                      />
                    </article>
                  );
                })}
              </div>
            </CardPanelBody>
          </CardPanel>
        </section>
      </main>

      {isConnectionModalOpen ? (
        <div className="connectionModalBackdrop" role="presentation" onMouseDown={closeConnectionModal}>
          <div
            className="connectionModalShell"
            role="dialog"
            aria-modal="true"
            aria-labelledby="byok-connection-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <CardPanel className="connectionModal">
              <CardPanelHeader className="card-panel-header--split connectionModalHeader">
                <h2 id="byok-connection-title" className="card-title">
                  {t("cards.connections.modal.title")}
                </h2>

                <button
                  type="button"
                  className="modalCloseIcon"
                  onClick={closeConnectionModal}
                  aria-label={t("cards.connections.modal.close")}
                >
                  ×
                </button>
              </CardPanelHeader>

              <CardPanelBody>
                <form className="modalFormStack" onSubmit={handleConnectionSubmit}>
                  <label className="fieldStack">
                    <span className="card-label">{t("cards.connections.modal.clientId")}</span>
                    <div className="inputControlWrap">
                      <input
                        className="input-like-base connectionInput"
                        value={connectionForm.clientId}
                        onChange={(event) => handleConnectionFieldChange("clientId", event.target.value)}
                        placeholder={t("cards.connections.modal.clientIdPlaceholder")}
                        autoComplete="off"
                      />
                      <button type="button" className="inputIconButton" aria-label={t("cards.connections.modal.copy")}>
                        <Copy size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </label>

                  <label className="fieldStack">
                    <span className="card-label">{t("cards.connections.modal.clientSecret")}</span>
                    <div className="inputControlWrap">
                      <input
                        className="input-like-base connectionInput"
                        type={showClientSecret ? "text" : "password"}
                        value={connectionForm.clientSecret}
                        onChange={(event) => handleConnectionFieldChange("clientSecret", event.target.value)}
                        placeholder={t("cards.connections.modal.clientSecretPlaceholder")}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="inputIconButton inputIconButton--visibility"
                        aria-label={showClientSecret ? t("cards.connections.modal.hideSecret") : t("cards.connections.modal.showSecret")}
                        onClick={() => setShowClientSecret((current) => !current)}
                      >
                        {showClientSecret ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                      </button>
                      <button type="button" className="inputIconButton inputIconButton--copy" aria-label={t("cards.connections.modal.copy")}>
                        <Copy size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </label>

                  <label className="fieldStack">
                    <span className="card-label">{t("cards.connections.modal.itemIds")}</span>
                    <div className="inputControlWrap">
                      <input
                        className="input-like-base connectionInput"
                        type="text"
                        value={connectionForm.itemIds}
                        onChange={(event) => handleConnectionFieldChange("itemIds", event.target.value)}
                        placeholder={t("cards.connections.modal.itemIdsPlaceholder")}
                        spellCheck={false}
                        data-gramm="false"
                        data-gramm_editor="false"
                        data-enable-grammarly="false"
                      />
                      <button type="button" className="inputIconButton" aria-label={t("cards.connections.modal.copy")}>
                        <Copy size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </label>

                  <div className="modalActions">
                    <button type="submit" className="btn-base btn-card">
                      {t("cards.connections.modal.saveAndConnect")}
                    </button>
                  </div>
                </form>
              </CardPanelBody>
            </CardPanel>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .layoutGrid {
          display: grid;
          grid-template-columns: 1.95fr 1fr;
          gap: 1rem;
        }

        .panelWide {
          min-height: 178px;
        }

        .panelNarrow {
          min-height: 178px;
        }

        .panelFull {
          grid-column: 1 / -1;
          min-height: 238px;
        }

        .connectionsToolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.65rem;
          width: 100%;
          margin-bottom: 0.85rem;
          flex-wrap: wrap;
        }

        .connectionsCount {
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          width: fit-content;
          color: var(--primary);
          font-size: calc(var(--font-size-sm) - 2px);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .userBody {
          display: grid;
          gap: 0.95rem;
        }

        .userDivider {
          padding: 0;
        }

        .profileRow {
          display: grid;
          align-items: center;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 0.62rem;
        }

        .avatarEditButton {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          border-radius: 999px;
        }

        .avatarEditButton .account-avatar {
          width: 42px;
          height: 42px;
          font-size: 0.9rem;
        }

        .avatarEditOverlay {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: color-mix(in srgb, var(--foreground) 92%, transparent);
          background: color-mix(in srgb, var(--background) 52%, transparent);
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .avatarEditButton:hover .avatarEditOverlay {
          opacity: 1;
        }

        .nameFieldWrap {
          position: relative;
          width: min(360px, 100%);
        }

        .nameField {
          width: 100%;
          border: 1px solid color-mix(in srgb, var(--glass-border) 84%, transparent);
          background: color-mix(in srgb, var(--background) 52%, transparent);
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0.55rem;
          cursor: text;
          padding-right: 2.1rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .nameInput {
          width: 100%;
          border: 1px solid color-mix(in srgb, var(--primary) 52%, var(--glass-border));
          background: color-mix(in srgb, var(--background) 72%, transparent);
          outline: none;
          padding-right: 2.1rem;
        }

        .nameEditOverlay {
          position: absolute;
          right: 0.65rem;
          top: 50%;
          transform: translateY(-50%);
          color: color-mix(in srgb, var(--foreground) 56%, transparent);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, color 0.2s ease;
        }

        .nameFieldWrap:hover .nameEditOverlay,
        .nameFieldWrap:focus-within .nameEditOverlay,
        .nameFieldWrap.isEditing .nameEditOverlay {
          opacity: 1;
        }

        .saveNameSlot {
          width: 84px;
          display: inline-flex;
          justify-content: flex-end;
        }

        .saveNameButton {
          white-space: nowrap;
        }

        .helperText {
          margin: 0;
          color: color-mix(in srgb, var(--foreground) 56%, transparent);
        }

        .sectionLink {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0.6rem;
          width: 100%;
          background: transparent;
          appearance: none;
          -webkit-appearance: none;
          color: color-mix(in srgb, var(--foreground) 62%, transparent);
          font-weight: 600;
          font-size: var(--font-size-sm);
          text-decoration: none;
          text-align: left;
          padding: 0;
          cursor: pointer;
        }

        .actionsGrid {
          margin-top: 0.72rem;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.55rem;
        }

        .connectionGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.8rem;
          min-height: 186px;
        }

        .connectionError {
          padding-bottom: 0.68rem;
          color: color-mix(in srgb, #e44b4b 85%, var(--foreground) 15%);
          font-size: var(--font-size-sm);
        }

        .connectionLoading {
          margin: 0;
          padding-bottom: 0.68rem;
          color: color-mix(in srgb, var(--foreground) 58%, transparent);
          font-size: var(--font-size-sm);
        }

        .connectionCard {
          border: 1px solid color-mix(in srgb, var(--glass-border) 66%, transparent);
          border-radius: var(--radius-md);
          background:
            linear-gradient(
              160deg,
              color-mix(in srgb, var(--background) 87%, transparent),
              color-mix(in srgb, var(--glass-bg) 64%, transparent)
            );
          min-height: 172px;
          padding: var(--card-body-padding);
          display: grid;
          grid-template-rows: auto 1fr auto auto;
          gap: 0.6rem;
        }

        .connectionCard.placeholder {
          border-style: dashed;
          background: color-mix(in srgb, var(--background) 15%, transparent);
        }

        .connectionModalBackdrop {
          position: fixed;
          inset: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          overflow-y: auto;
          overscroll-behavior: contain;
          background: color-mix(in srgb, #000 62%, transparent);
          backdrop-filter: blur(10px);
        }

        .connectionModalShell {
          width: min(100%, 720px);
          max-height: calc(100dvh - 2rem);
          margin: auto;
        }

        .connectionModal {
          overflow-y: auto;
        }

        .connectionModalHeader {
          padding-top: 0.9rem;
          padding-bottom: 0.9rem;
          min-height: calc(var(--control-height-card) + 1.8rem);
        }

        .modalCloseIcon {
          border: 0;
          background: transparent;
          color: color-mix(in srgb, var(--foreground) 78%, transparent);
          width: 24px;
          height: 24px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-heading);
          line-height: 1;
          cursor: pointer;
        }

        .modalCloseIcon:hover {
          color: color-mix(in srgb, var(--foreground) 96%, transparent);
        }

        .connectionTopRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .connectionTopRow :global(.institutionLogo) {
          width: 42px;
          height: 42px;
          border-radius: 12px;
        }

        .connectionPulse {
          display: inline-block;
          flex-shrink: 0;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--primary) 72%, transparent);
          box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 38%, transparent);
          animation: pulse 1.8s ease-out infinite;
        }

        .connectionMeta {
          display: grid;
          gap: 0.24rem;
        }

        .connectionName {
          margin: 0;
          font-size: var(--font-size-base);
          font-weight: 700;
          color: color-mix(in srgb, var(--foreground) 92%, transparent);
        }

        .connectionUpdated {
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: 0.32rem;
          font-size: var(--font-size-sm);
          color: color-mix(in srgb, var(--foreground) 56%, transparent);
        }

        .connectionUpdated svg {
          color: color-mix(in srgb, var(--foreground) 50%, transparent);
        }

        .connectionItemId {
          margin: 0;
          font-size: var(--font-size-sm);
          color: color-mix(in srgb, var(--foreground) 44%, transparent);
          word-break: break-all;
        }

        .connectionDivider {
          padding: 0;
        }

        .connectionDetails {
          color: color-mix(in srgb, var(--foreground) 62%, transparent);
        }

        @media (max-width: 1024px) {
          .layoutGrid {
            grid-template-columns: 1fr;
          }

          .connectionGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .connectionModal {
            width: min(100%, 640px);
          }
        }

        @media (max-width: 640px) {
          .profileRow {
            grid-template-columns: auto minmax(0, 1fr);
          }

          .saveNameSlot {
            grid-column: 1 / -1;
            width: 100%;
            justify-content: flex-start;
          }

          .actionsGrid {
            grid-template-columns: 1fr;
          }

          .connectionGrid {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .connectionCard.placeholder {
            display: none;
          }

          .nameField {
            min-width: 0;
            width: 100%;
          }

          .profileRow {
            align-items: stretch;
          }

          .connectionsToolbar,
          .modalActions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}