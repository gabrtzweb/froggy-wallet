import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const localeCookie = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale = localeCookie === "pt" || localeCookie === "pt-BR" ? "pt-BR" : "en";

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
