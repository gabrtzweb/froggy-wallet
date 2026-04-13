import { ChevronRight } from "lucide-react";
import type { MouseEventHandler } from "react";
import Link from "next/link";

type SectionLinkProps = {
  label: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function SectionLink({ label, href, onClick, className }: SectionLinkProps) {
  const classes = joinClasses("sectionLink content-sm", className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        <span>{label}</span>
        <ChevronRight size={14} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      <span>{label}</span>
      <ChevronRight size={14} aria-hidden="true" />
    </button>
  );
}