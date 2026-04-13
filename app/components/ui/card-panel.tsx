import type { ReactNode } from "react";

type CardPanelProps = {
  children: ReactNode;
  className?: string;
};

type CardPanelHeaderProps = {
  children: ReactNode;
  className?: string;
};

type CardPanelKickerProps = {
  children: ReactNode;
  className?: string;
};

type CardPanelBodyProps = {
  children: ReactNode;
  className?: string;
};

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function CardPanel({ children, className }: CardPanelProps) {
  return <article className={joinClasses("card-panel", className)}>{children}</article>;
}

export function CardPanelHeader({ children, className }: CardPanelHeaderProps) {
  return <header className={joinClasses("card-panel-header", className)}>{children}</header>;
}

export function CardPanelKicker({ children, className }: CardPanelKickerProps) {
  return <p className={joinClasses("card-panel-kicker", className)}>{children}</p>;
}

export function CardPanelBody({ children, className }: CardPanelBodyProps) {
  return <div className={joinClasses("card-panel-body", className)}>{children}</div>;
}
