import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { hasPluggyCredentials } from "@/app/lib/server/pluggy";
import { Resources } from "@/app/pages/assets";
import { Flow } from "@/app/pages/flow";
import { Overview } from "@/app/pages/overview";
import { Planning } from "@/app/pages/planning";
import { Settings } from "@/app/pages/settings";
import { SettingsApiDataDetails } from "@/app/pages/settings/api-data";
import { SettingsConnectionDetails } from "@/app/pages/settings/connection-details";
import { SettingsUserDataDetails } from "@/app/pages/settings/user-data";
import { SettingsUserInformationDetails } from "@/app/pages/settings/user-information";

type Slug = "overview" | "flow" | "resources" | "planning" | "settings";
type RewrittenSlug = "settings-user-data" | "settings-api-data" | "settings-user-information" | "settings-connections";

type Props = {
  params: Promise<{ slug: Slug | RewrittenSlug }>;
  searchParams: Promise<{ itemId?: string | string[] }>;
};

type RouteProps = {
  isPluggyAvailable?: boolean;
};

const routes: Record<Slug, ComponentType<RouteProps>> = {
  overview: Overview,
  flow: Flow,
  resources: Resources,
  planning: Planning,
  settings: Settings as ComponentType<RouteProps>,
};

const pluggyGuardedRoutes = new Set<Slug>(["overview", "flow", "resources", "planning"]);

export function generateStaticParams() {
  return [
    { slug: "overview" },
    { slug: "flow" },
    { slug: "resources" },
    { slug: "planning" },
    { slug: "settings" },
    { slug: "settings-user-data" },
    { slug: "settings-api-data" },
    { slug: "settings-user-information" },
    { slug: "settings-connections" },
  ];
}

export const dynamicParams = false;

export default async function SlugPage({ params, searchParams }: Props) {
  const { slug } = await params;

  if (slug === "settings-user-data") {
    return <SettingsUserDataDetails />;
  }

  if (slug === "settings-api-data") {
    return <SettingsApiDataDetails />;
  }

  if (slug === "settings-user-information") {
    return <SettingsUserInformationDetails />;
  }

  if (slug === "settings-connections") {
    const { itemId } = await searchParams;
    const resolvedItemId = Array.isArray(itemId) ? itemId[0] : itemId;

    if (!resolvedItemId) {
      notFound();
    }

    return <SettingsConnectionDetails itemId={resolvedItemId} />;
  }

  const Route = routes[slug as Slug];

  if (!Route) {
    notFound();
  }

  const typedSlug = slug as Slug;
  const shouldGuardWithPluggy = pluggyGuardedRoutes.has(typedSlug);
  const isPluggyAvailable = shouldGuardWithPluggy ? await hasPluggyCredentials() : true;

  return <Route isPluggyAvailable={isPluggyAvailable} />;
}