"use client";

import { ArrowRight, LayoutDashboard, Zap } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Home() {
  const t = useTranslations("home");
  const line3 = t("title.line3");
  const [line3Lead, ...line3RestParts] = line3.split(" ");
  const line3Rest = line3RestParts.join(" ");

  return (
    <div className="page">
      <main className="main">
        <section className="hero">
          <div className="copyBlock">
            <p className="badge">
              <Zap size={14} className="badgeIcon" aria-hidden="true" />
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
            <div className="topRow">
              <span className="block blockMuted" />
              <span className="block blockAccent" />
            </div>
            <div className="mainGrid">
              <span className="block blockPrimary large" />
              <span className="block blockSecondary tall" />
              <span className="block blockLight" />
              <span className="block blockDark" />
              <span className="block blockAccent" />
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .page {
          min-height: calc(100svh - 94px - 72px);
          display: flex;
          align-items: center;
          padding: var(--padding-card) 0;
          color: var(--foreground);
        }

        .main {
          width: min(1200px, calc(100% - 24px));
          margin: 0 auto;
          display: block;
        }

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
          color: color-mix(in srgb, var(--foreground) 90%, transparent);
          font-size: 0.74rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .badgeIcon {
          color: color-mix(in srgb, var(--primary) 72%, var(--foreground) 28%);
        }

        .title {
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          font-family: var(--font-heading);
          font-size: clamp(1.8rem, 4.4vw, 3.55rem);
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
          font-size: 1.08rem;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .buttonWithIcon {
          gap: 0.5rem;
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
          display: grid;
          padding: var(--padding-card);
          border-radius: var(--radius-lg);
          border: 1px solid color-mix(in srgb, var(--glass-border) 70%, transparent);
          background: color-mix(in srgb, var(--glass-bg) 50%, transparent);
          backdrop-filter: blur(12px);
        }

        @media (max-width: 1024px) {
          .page {
            min-height: calc(100svh - 132px - 72px);
          }
        }

        @media (max-width: 640px) {
          .page {
            min-height: auto;
            align-items: flex-start;
            padding: calc(var(--padding-card) * 0.7) 0 var(--padding-card);
          }

          .main {
            width: min(1200px, calc(100% - 16px));
          }

          .hero {
            grid-template-columns: 1fr;
            min-height: 0;
          }

          .previewPanel {
            min-height: 320px;
          }
        }
      `}</style>
    </div>
  );
}