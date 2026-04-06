"use client";

import { useTranslations } from "next-intl";
import { FaCode, FaGithub } from "react-icons/fa";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="footer">
      <div className="inner app-page-main">
        <div className="left">
          <span className="pulseDot" aria-hidden="true" />
          <p className="text">{t("version")}</p>
        </div>

        <div className="right">
          <div className="socials">
            <a
              href="https://github.com/gabrtzweb/froggy-wallet"
              aria-label="GitHub"
              className="iconLink"
              target="_blank"
              rel="noreferrer"
            >
              <FaGithub />
            </a>
            <a
              href="https://flamma.digital/"
              aria-label="Flamma Digital"
              className="iconLink"
              target="_blank"
              rel="noreferrer"
            >
              <FaCode />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}