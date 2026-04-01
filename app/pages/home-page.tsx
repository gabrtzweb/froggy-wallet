"use client";

import { ArrowRight, Code2, Zap } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "../styles/home-page.module.css";

export function HomePage() {
  const t = useTranslations("home");
  const line3 = t("title.line3");
  const [line3Lead, ...line3RestParts] = line3.split(" ");
  const line3Rest = line3RestParts.join(" ");

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.copyBlock}>
            <p className={styles.badge}>
              <Zap size={14} className={styles.badgeIcon} aria-hidden="true" />
              {t("badge")}
            </p>
            <h1 className={styles.title}>
              <span>{t("title.line1")}</span>
              <span>
                <span className={styles.titleAccent}>{t("title.line2")}</span>{" "}
                <span className={styles.titleNeutralInline}>{line3Lead}</span>
              </span>
              <span>{line3Rest}</span>
            </h1>
            <p className={styles.subtitle}>{t("subtitle")}</p>

            <div className={styles.actions}>
              <Link href="/settings" className={`btn-base btn-primary ${styles.buttonWithIcon}`}>
                {t("buttons.primary")}
                <span className={styles.buttonIconWrap} aria-hidden="true">
                  <ArrowRight size={16} className={styles.buttonIcon} />
                </span>
              </Link>
              <Link href="/api" className={`btn-base btn-secondary ${styles.buttonWithIcon}`}>
                {t("buttons.secondary")}
                <span className={styles.buttonIconWrap} aria-hidden="true">
                  <Code2 size={16} className={styles.buttonIcon} />
                </span>
              </Link>
            </div>
          </div>

          <div className={styles.previewPanel} aria-hidden="true">
            <div className={styles.topRow}>
              <span className={`${styles.block} ${styles.blockMuted}`} />
              <span className={`${styles.block} ${styles.blockAccent}`} />
            </div>
            <div className={styles.mainGrid}>
              <span className={`${styles.block} ${styles.blockPrimary} ${styles.large}`} />
              <span className={`${styles.block} ${styles.blockSecondary} ${styles.tall}`} />
              <span className={`${styles.block} ${styles.blockLight}`} />
              <span className={`${styles.block} ${styles.blockDark}`} />
              <span className={`${styles.block} ${styles.blockAccent}`} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
