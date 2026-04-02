import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { ApiGuide } from "@/app/pages/api-guide";
import { Assets } from "@/app/pages/assets";
import { Flow } from "@/app/pages/flow";
import { Overview } from "@/app/pages/overview";
import { Planning } from "@/app/pages/planning";
import { Settings } from "@/app/pages/settings";

type Slug = "overview" | "flow" | "assets" | "planning" | "settings" | "api-guide";

type Props = {
  params: Promise<{ slug: string }>;
};

const routes: Record<Slug, ComponentType> = {
  overview: Overview,
  flow: Flow,
  assets: Assets,
  planning: Planning,
  settings: Settings,
  "api-guide": ApiGuide,
};

export function generateStaticParams() {
  return Object.keys(routes).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const Route = routes[slug as Slug];

  if (!Route) {
    notFound();
  }

  return <Route />;
}
