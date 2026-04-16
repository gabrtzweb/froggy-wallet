import type { Metadata } from "next";
import { Karla, Rubik } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { AppProviders } from "./providers";
import "./globals.css";

const karla = Karla({
  variable: "--font-karla",
  weight: ["400", "600"],
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  weight: ["500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Froggy Wallet",
  description:
    "Connect your bank accounts and manage your finances with Froggy Wallet. Secure open banking integration with real-time account insights."
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const themeInitializer = `(() => {
    try {
      const storedTheme = window.localStorage.getItem("froggy-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : (prefersDark ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", theme);
    } catch {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  })();`;

  return (
    <html
      lang="en"
      className={`${karla.variable} ${rubik.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Script id="theme-initializer" strategy="beforeInteractive">
          {themeInitializer}
        </Script>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            <div className="app-chrome">
              <Header />
              <div className="app-shell">
                {children}
              </div>
              <Footer />
            </div>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
