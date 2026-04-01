import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AssetsPage } from "../pages/assets-page";
import { FlowPage } from "../pages/flow-page";
import { OverviewPage } from "../pages/overview-page";
import { PlanningPage } from "../pages/planning-page";
import { SettingsPage } from "../pages/settings-page";

type Slug = "overview" | "flow" | "assets" | "planning" | "settings";

type Props = {
  params: Promise<{ slug: string }>;
};

const routes: Record<Slug, () => ReactNode> = {
  overview: OverviewPage,
  flow: FlowPage,
  assets: AssetsPage,
  planning: PlanningPage,
  settings: SettingsPage,
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
