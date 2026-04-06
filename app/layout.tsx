import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { AppProviders } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Froggy Wallet",
  description:
    "Connect your bank accounts and manage your finances with Froggy Wallet. Secure open banking integration with real-time account insights.",
  icons: {
    icon: "/assets/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            <Header />
            <div className="app-shell">
              {children}
            </div>
            <Footer />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
