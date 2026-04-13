import type { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";

type CardActionProps = {
  children: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  className?: string;
};

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function CardAction({
  children,
  href,
  onClick,
  type = "button",
  className,
}: CardActionProps) {
  const actionClassName = joinClasses("card-btn-outline btn-sm-outline", className);

  if (href) {
    return (
      <Link href={href} className={actionClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={actionClassName}>
      {children}
    </button>
  );
}