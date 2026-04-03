import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { Resources } from "@/app/pages/assets";
import { Flow } from "@/app/pages/flow";
import { Overview } from "@/app/pages/overview";
import { Planning } from "@/app/pages/planning";
import { Settings } from "@/app/pages/settings";

type Slug = "overview" | "flow" | "resources" | "planning" | "settings";

type Props = {
  params: Promise<{ slug: string }>;
};

const routes: Record<Slug, ComponentType> = {
  overview: Overview,
  flow: Flow,
  resources: Resources,
  planning: Planning,
  settings: Settings,
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
