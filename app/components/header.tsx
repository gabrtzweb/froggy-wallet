"use client";

import { Globe, Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createProfileInitials,
  getProfileFirstName,
  useProfileImageDataUrl,
  useProfileName,
} from "@/app/lib/profile-client";

type Theme = "light" | "dark";
type Locale = "en" | "pt-BR";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem("froggy-theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem("froggy-theme", theme);
}

export function Header() {
  const t = useTranslations("header");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const fallbackProfileName = t("account.name");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const profileName = useProfileName(fallbackProfileName);
  const profileImageDataUrl = useProfileImageDataUrl();
  const displayName = getProfileFirstName(profileName);

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
    const nextLocale = locale === "en" ? "pt-BR" : "en";

    document.documentElement.setAttribute("data-locale", nextLocale);
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  return (
    <header className="header header-glass">
      <div className="inner app-page-main">
        <Link href="/" className="brand" aria-label={t("aria.dashboard")}>
          <span className="logo" aria-hidden="true">
            <Image src="/assets/logo.png" alt="" width={32} height={32} className="froggyLogo" aria-hidden="true" />
          </span>
          <span className="title">{t("brand")}</span>
        </Link>

        <nav
          id="site-navigation"
          className={`nav ${isMenuOpen ? "navOpen" : ""}`}
          aria-label={t("aria.mainNav")}
        >
          <Link href="/overview" className="navLink" onClick={closeMenu}>
            {t("nav.overview")}
          </Link>
          <Link href="/flow" className="navLink" onClick={closeMenu}>
            {t("nav.flow")}
          </Link>
          <Link href="/resources" className="navLink" onClick={closeMenu}>
            {t("nav.assets")}
          </Link>
          <Link href="/planning" className="navLink" onClick={closeMenu}>
            {t("nav.planning")}
          </Link>
        </nav>

        <div className="actions">
          <button
            type="button"
            className="chip"
            onClick={handleThemeToggle}
            aria-label={t("actions.toggleTheme")}
            title={t("titles.toggleTheme")}
          >
            <span className="themeIcon" aria-hidden="true">
              <Sun size={18} className="sunIcon" />
              <Moon size={18} className="moonIcon" />
            </span>
          </button>
          <button
            type="button"
            className="chip"
            onClick={handleLanguageToggle}
            aria-label={t("actions.selectLanguage")}
            title={t("titles.language")}
          >
            <span className="languageIcon" aria-hidden="true">
              <Globe size={18} className="enLocaleIcon" />
              <Languages size={18} className="ptLocaleIcon" />
            </span>
          </button>
          <Link href="/settings" className="account" aria-label={t("actions.account")}>
            <span className="avatar" aria-hidden="true">
              {profileImageDataUrl ? (
                <Image
                  src={profileImageDataUrl}
                  alt=""
                  width={30}
                  height={30}
                  unoptimized
                  className="avatarImage"
                  aria-hidden="true"
                />
              ) : (
                createProfileInitials(profileName)
              )}
            </span>
            <span className="accountText">
              <span className="hello">{t("account.hello")} </span>
              <span className="name">{displayName}</span>
            </span>
          </Link>
          <button
            type="button"
            className="chip menuButton"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="site-navigation"
            title={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}