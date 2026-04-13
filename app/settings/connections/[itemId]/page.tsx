import { SettingsConnectionDetails } from "@/app/pages/settings-connection-details";

type Props = {
  params: Promise<{ itemId: string }>;
};

export default async function Page({ params }: Props) {
  const { itemId } = await params;

  return <SettingsConnectionDetails itemId={itemId} />;
}
