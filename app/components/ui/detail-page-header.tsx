import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

type DetailPageHeaderProps = {
  backHref: string;
  backLabel: string;
  kicker: string;
  title: ReactNode;
  subtitle?: ReactNode;
  logo: ReactNode;
};

export function DetailPageHeader({
  backHref,
  backLabel,
  kicker,
  title,
  subtitle,
  logo,
}: DetailPageHeaderProps) {
  return (
    <>
      <Link href={backHref} className="backLink">
        <ChevronLeft size={14} aria-hidden="true" />
        <span>{backLabel}</span>
      </Link>

      <header className="detailHero">
        {logo}
        <div className="detailHeroCopy">
          <p className="detailKicker">{kicker}</p>
          <h1>{title}</h1>
          {subtitle ? <p className="detailSubtitle">{subtitle}</p> : null}
        </div>
      </header>
    </>
  );
}