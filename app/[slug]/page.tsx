import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Assets } from "@/app/pages/assets";
import { Flow } from "@/app/pages/flow";
import { Overview } from "@/app/pages/overview";
import { Planning } from "@/app/pages/planning";
import { Settings } from "@/app/pages/settings";

type Slug = "overview" | "flow" | "assets" | "planning" | "settings";

type Props = {
  params: Promise<{ slug: string }>;
};

const routes: Record<Slug, () => ReactNode> = {
  overview: Overview,
  flow: Flow,
  assets: Assets,
  planning: Planning,
  settings: Settings,
};

export function generateStaticParams() {
  return Object.keys(routes).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const route = routes[slug as Slug];

  if (!route) {
    notFound();
  }

  return route();
}
