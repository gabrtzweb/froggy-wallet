"use client";

import { Globe, Languages, Moon, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "../styles/site-header.module.css";

type Theme = "light" | "dark";
type Locale = "en" | "pt";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem("froggy-theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem("froggy-theme", theme);
}

export function SiteHeader() {
  const t = useTranslations("header");
  const locale = useLocale() as Locale;
  const router = useRouter();

  useEffect(() => {
    applyTheme(getPreferredTheme());
    document.documentElement.setAttribute("data-locale", locale);
  }, [locale]);

  function handleThemeToggle() {
    const currentTheme =
      (document.documentElement.getAttribute("data-theme") as Theme | null) ??
      getPreferredTheme();
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
  }

  function handleLanguageToggle() {
    const nextLocale = locale === "en" ? "pt" : "en";

    document.documentElement.setAttribute("data-locale", nextLocale);
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <header className={`${styles.header} header-glass`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={t("aria.dashboard")}>
          <span className={styles.logo} aria-hidden="true">
            🐸
          </span>
          <span className={styles.title}>{t("brand")}</span>
        </Link>

        <nav className={styles.nav} aria-label={t("aria.mainNav")}>
          <Link href="/overview" className={styles.navLink}>
            {t("nav.overview")}
          </Link>
          <Link href="/flow" className={styles.navLink}>
            {t("nav.flow")}
          </Link>
          <Link href="/assets" className={styles.navLink}>
            {t("nav.assets")}
          </Link>
          <Link href="/planning" className={styles.navLink}>
            {t("nav.planning")}
          </Link>
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.chip}
            onClick={handleThemeToggle}
            aria-label={t("actions.toggleTheme")}
            title={t("titles.toggleTheme")}
          >
            <span className={styles.themeIcon} aria-hidden="true">
              <Sun size={18} className={styles.sunIcon} />
              <Moon size={18} className={styles.moonIcon} />
            </span>
          </button>
          <button
            type="button"
            className={styles.chip}
            onClick={handleLanguageToggle}
            aria-label={t("actions.selectLanguage")}
            title={t("titles.language")}
          >
            <span className={styles.languageIcon} aria-hidden="true">
              <Globe size={18} className={styles.enLocaleIcon} />
              <Languages size={18} className={styles.ptLocaleIcon} />
            </span>
          </button>
          <Link href="/settings" className={styles.account} aria-label={t("actions.account")}>
            <span className={styles.avatar} aria-hidden="true">
              U
            </span>
            <span className={styles.accountText}>
              <span className={styles.hello}>{t("account.hello")} </span>
              <span className={styles.name}>{t("account.name")}</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
