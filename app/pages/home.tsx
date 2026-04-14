"use client";


import { ArrowRight, LayoutDashboard, Lock, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { InstitutionLogo } from "@/app/components/institution-logo";
import { resolveInstitutionIdentity } from "@/app/lib/institution-utils";

export function Home() {
  const t = useTranslations("home");
  const previewStackRef = useRef<HTMLDivElement | null>(null);
  const line3 = t("title.line3");
  const [line3Lead, ...line3RestParts] = line3.split(" ");
  const line3Rest = line3RestParts.join(" ");
  const accounts = [
    {
      name: t("preview.accounts.nubank.name"),
      updated: t("preview.accounts.nubank.updated"),
      value: t("preview.accounts.nubank.value"),
    },
    {
      name: t("preview.accounts.inter.name"),
      updated: t("preview.accounts.inter.updated"),
      value: t("preview.accounts.inter.value"),
    },
    {
      name: t("preview.accounts.bb.name"),
      updated: t("preview.accounts.bb.updated"),
      value: t("preview.accounts.bb.value"),
    },
  ];

  function setTiltFromPointer(clientX: number, clientY: number) {
    const element = previewStackRef.current;

    if (!element) {
      return;
    }

    const bounds = element.getBoundingClientRect();
    const relativeX = (clientX - bounds.left) / bounds.width;
    const relativeY = (clientY - bounds.top) / bounds.height;
    const rotateY = (relativeX - 0.5) * 7;
    const rotateX = (0.5 - relativeY) * 6;

    element.style.setProperty("--tilt-x", `${rotateY.toFixed(2)}deg`);
    element.style.setProperty("--tilt-y", `${rotateX.toFixed(2)}deg`);
    element.style.setProperty("--parallax-x", `${((relativeX - 0.5) * 6).toFixed(2)}px`);
    element.style.setProperty("--parallax-y", `${((relativeY - 0.5) * 6).toFixed(2)}px`);
  }

  function resetTilt() {
    const element = previewStackRef.current;

    if (!element) {
      return;
    }

    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--parallax-x", "0px");
    element.style.setProperty("--parallax-y", "0px");
  }

  return (
    <div className="app-page app-page--centered">
      <main className="app-page-main app-page-main--block">
        <section className="hero">
          <div className="copyBlock">
            <p className="badge">
              <Zap size={14} aria-hidden="true" />
              {t("badge")}
            </p>
            <h1 className="title">
              <span>{t("title.line1")}</span>
              <span>
                <span className="titleAccent">{t("title.line2")}</span>{" "}
                <span className="titleNeutralInline">{line3Lead}</span>
              </span>
              <span>{line3Rest}</span>
            </h1>
            <p className="subtitle">{t("subtitle")}</p>

            <div className="actions">
              <Link href="/settings" className="btn-base btn-primary buttonWithIcon">
                {t("buttons.primary")}
                <span className="buttonIconWrap" aria-hidden="true">
                  <ArrowRight size={16} className="buttonIcon" />
                </span>
              </Link>
              <Link href="/overview" className="btn-base btn-secondary buttonWithIcon">
                {t("buttons.secondary")}
                <span className="buttonIconWrap" aria-hidden="true">
                  <LayoutDashboard size={16} className="buttonIcon" />
                </span>
              </Link>
            </div>
          </div>

          <div className="previewPanel" aria-hidden="true">
            <div
              ref={previewStackRef}
              className="previewStack"
              onPointerMove={(event) => setTiltFromPointer(event.clientX, event.clientY)}
              onPointerLeave={resetTilt}
            >
              <article className="walletCard">
                <header className="walletHeaderRow">
                  <p className="walletTitle">{t("preview.connectedAccounts")}</p>
                  <span className="walletStatus">{t("preview.statusActive")}</span>
                </header>

                <div className="walletList">
                  {accounts.map((account) => {
                    const identity = resolveInstitutionIdentity({ institutionName: account.name });

                    return (
                      <div className="walletItem" key={account.name}>
                        <InstitutionLogo institutionName={identity.name} institutionDomain={identity.domain} />
                        <div className="walletMeta">
                          <p className="bankName">{account.name}</p>
                          <p className="bankUpdate">{account.updated}</p>
                        </div>
                        <p className="bankValue">{account.value}</p>
                      </div>
                    );
                  })}
                </div>

                <footer className="walletTotal">
                  <span>{t("preview.totalWealth")}</span>
                  <strong>{t("preview.totalValue")}</strong>
                </footer>
              </article>

              <aside className="floatingCard floatingTopRight">
                <Lock size={12} className="floatingIcon" aria-hidden="true" />
                <p className="floatingLabel">{t("preview.encryptedData")}</p>
              </aside>

              <aside className="floatingCard floatingBottomLeft">
                <RefreshCw size={12} className="floatingIcon" aria-hidden="true" />
                <p className="floatingLabel">{t("preview.syncedNow")}</p>
              </aside>
            </div>
          </div>
        </section>
        </main>

        <style jsx>{`
        .hero {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          align-items: center;
          align-content: center;
          gap: 2.2rem;
          min-height: 0;
          padding: 0.8rem 0 1.2rem;
        }

        .copyBlock {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .badge {
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          width: fit-content;
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius-full);
          border: 1px solid color-mix(in srgb, var(--primary) 36%, transparent);
          background: color-mix(in srgb, var(--secondary) 16%, transparent);
          color: var(--primary);
          font-size: var(--font-size-sm);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .title {
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          font-family: var(--font-heading);
          font-size: var(--font-size-hero);
          line-height: 1.04;
          letter-spacing: -0.02em;
        }

        .titleAccent {
          background: linear-gradient(120deg, var(--primary), var(--accent));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .titleNeutralInline {
          color: var(--foreground);
        }

        .subtitle {
          margin: 0;
          max-width: 44ch;
          color: color-mix(in srgb, var(--foreground) 78%, transparent);
          font-size: var(--font-size-base);
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .buttonIconWrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .buttonIcon {
          flex-shrink: 0;
        }

        .previewPanel {
          position: relative;
          min-height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          overflow: visible;
          isolation: isolate;
        }

        .previewStack {
          position: relative;
          z-index: 1;
          width: min(100%, 386px);
          --tilt-x: 0deg;
          --tilt-y: 0deg;
          --parallax-x: 0px;
          --parallax-y: 0px;
          perspective: 1200px;
          transform-style: preserve-3d;
        }

        .previewPanel::before {
          content: "";
          position: absolute;
          width: 320px;
          height: 320px;
          right: -42px;
          top: -36px;
          background:
            radial-gradient(circle at center, color-mix(in srgb, var(--secondary) 26%, transparent), transparent 68%);
          filter: blur(10px);
          z-index: 0;
          pointer-events: none;
        }

        .previewPanel::after {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          left: -58px;
          bottom: -62px;
          background:
            radial-gradient(circle at center, color-mix(in srgb, var(--primary) 28%, transparent), transparent 70%);
          filter: blur(12px);
          z-index: 0;
          pointer-events: none;
        }

        .walletCard {
          position: relative;
          z-index: 1;
          margin: 0;
          width: 100%;
          min-height: 392px;
          border-radius: 18px;
          border: 1px solid color-mix(in srgb, var(--glass-border) 76%, transparent);
          background:
            linear-gradient(
              175deg,
              color-mix(in srgb, var(--background) 91%, transparent),
              color-mix(in srgb, var(--glass-bg) 52%, transparent)
            );
          box-shadow:
            0 28px 60px color-mix(in srgb, var(--background) 62%, transparent),
            inset 0 1px 0 color-mix(in srgb, var(--foreground) 8%, transparent);
          padding: var(--padding-card);
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 0.9rem;
          transform: rotateX(var(--tilt-y)) rotateY(var(--tilt-x));
          transform-style: preserve-3d;
          transition: transform 240ms ease, box-shadow 240ms ease;
          will-change: transform;
        }

        .previewStack:hover .walletCard {
          box-shadow:
            0 32px 64px color-mix(in srgb, var(--background) 60%, transparent),
            inset 0 1px 0 color-mix(in srgb, var(--foreground) 9%, transparent);
        }

        .walletHeaderRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          transform: translateZ(24px);
        }

        .walletTitle {
          margin: 0;
          font-size: var(--font-size-base);
          color: color-mix(in srgb, var(--foreground) 82%, transparent);
          font-weight: 700;
          letter-spacing: 0.01em;
        }

        .walletStatus {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
          font-weight: 700;
          background: color-mix(in srgb, var(--primary) 20%, transparent);
          color: color-mix(in srgb, var(--primary) 88%, var(--foreground) 12%);
          border: 1px solid color-mix(in srgb, var(--primary) 28%, transparent);
        }

        .walletList {
          display: grid;
          transform: translateZ(14px);
        }

        .walletItem {
          display: grid;
          grid-template-columns: 30px 1fr auto;
          align-items: center;
          gap: 0.65rem;
          padding: 0.75rem 0;
          border-top: 1px solid color-mix(in srgb, var(--divider) 72%, transparent);
        }

        .walletItem:first-child {
          border-top: 1px solid color-mix(in srgb, var(--divider) 58%, transparent);
        }

        .walletMeta {
          min-width: 0;
        }

        .bankName {
          margin: 0;
          font-size: var(--font-size-base);
          font-weight: 700;
          color: color-mix(in srgb, var(--foreground) 90%, transparent);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bankUpdate {
          margin: 0.04rem 0 0;
          font-size: var(--font-size-sm);
          color: color-mix(in srgb, var(--foreground) 54%, transparent);
        }

        .bankValue {
          margin: 0;
          font-size: var(--font-size-base);
          font-weight: 700;
          color: color-mix(in srgb, var(--foreground) 88%, transparent);
          white-space: nowrap;
        }

        .walletTotal {
          border-radius: var(--radius-md);
          border: 1px solid color-mix(in srgb, var(--divider) 56%, transparent);
          background: color-mix(in srgb, var(--glass-bg) 65%, transparent);
          padding: 0.8rem 0.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          transform: translateZ(28px);
        }

        .walletTotal span {
          font-size: var(--font-size-base);
          color: color-mix(in srgb, var(--foreground) 58%, transparent);
          font-weight: 700;
        }

        .walletTotal strong {
          font-size: var(--font-size-heading);
          line-height: 1;
          letter-spacing: -0.02em;
          font-family: var(--font-heading);
          color: color-mix(in srgb, var(--foreground) 95%, transparent);
        }

        .floatingCard {
          position: absolute;
          display: inline-flex;
          align-items: center;
          gap: 0.42rem;
          border-radius: var(--radius-md);
          border: 1px solid color-mix(in srgb, var(--glass-border) 75%, transparent);
          backdrop-filter: blur(11px);
          box-shadow: 0 12px 34px color-mix(in srgb, var(--background) 64%, transparent);
          z-index: 2;
          will-change: transform;
          transform-style: preserve-3d;
        }

        .floatingTopRight {
          top: -1.55rem;
          right: -2rem;
          padding: 0.5rem 0.75rem;
          background: color-mix(in srgb, var(--accent) 10%, var(--glass-bg) 90%);
          z-index: 3;
          animation: floatTop 5.2s ease-in-out infinite;
          transform: translate3d(0, 0, 22px);
        }

        .floatingBottomLeft {
          left: -2rem;
          bottom: -1.5rem;
          padding: 0.5rem 0.75rem;
          background: color-mix(in srgb, var(--secondary) 10%, var(--glass-bg) 90%);
          z-index: 3;
          animation: floatBottom 6.1s ease-in-out infinite;
          transform: translate3d(0, 0, 18px);
        }

        .floatingIcon {
          flex-shrink: 0;
          color: color-mix(in srgb, var(--foreground) 74%, transparent);
        }

        @keyframes floatTop {
          0% {
            transform: translate3d(0, 0, 22px);
          }
          50% {
            transform: translate3d(0, -4px, 22px);
          }
          100% {
            transform: translate3d(0, 0, 22px);
          }
        }

        @keyframes floatBottom {
          0% {
            transform: translate3d(0, 0, 18px);
          }
          50% {
            transform: translate3d(0, 4px, 18px);
          }
          100% {
            transform: translate3d(0, 0, 18px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .floatingTopRight,
          .floatingBottomLeft,
          .walletCard {
            animation: none;
            transition: none;
            transform: none;
          }
        }

        .floatingLabel {
          margin: 0;
          font-size: var(--font-size-sm);
          font-weight: 700;
          color: color-mix(in srgb, var(--foreground) 80%, transparent);
        }

        @media (max-width: 640px) {
          .app-page--centered {
            align-items: flex-start;
          }

          .hero {
            grid-template-columns: 1fr;
            min-height: 0;
            gap: 5rem;
            padding-top: 0.4rem;
          }

          .copyBlock {
            gap: 1.05rem;
          }

          .actions {
            margin-top: 0.9rem;
          }

          .title {
            line-height: 1.06;
          }

          .previewPanel {
            min-height: 320px;
            padding: 0;
            margin-top: 0.85rem;
          }

          .previewStack {
            width: min(346px, calc(100% - 34px));
            margin-inline: auto;
          }

          .walletCard {
            margin: 0;
            width: 100%;
            min-height: 308px;
            padding: 0.82rem;
            transform: none;
          }

          .walletItem {
            grid-template-columns: 24px 1fr auto;
            gap: 0.55rem;
            padding: 0.63rem 0;
          }

          .floatingTopRight {
            top: -0.9rem;
            right: -0.72rem;
            transform: none;
          }

          .floatingBottomLeft {
            left: -0.72rem;
            bottom: -0.82rem;
            transform: none;
          }
        }
        `}</style>
      </div>
  );
}