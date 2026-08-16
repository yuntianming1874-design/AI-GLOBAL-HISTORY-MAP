import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import { ExplorerProvider } from "@/components/history/ExplorerProvider";
import { LocaleProvider } from "@/components/history/LocaleProvider";
import type { Locale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "AI Global History Map — Tang Era World Atlas",
  description:
    "Explore world history through an interactive timeline, historical map, person relationship graph and AI assistant — Tang Dynasty period (618–907) and its contemporaries worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // P0-3: default language follows the browser's Accept-Language
  // (?lang= and the user's saved choice still take precedence)
  const acceptLanguage = headers().get("accept-language") ?? "";
  const defaultLocale: Locale = /\bzh(?:-|\b|$)/i.test(acceptLanguage) ? "zh" : "en";
  return (
    <html lang={defaultLocale}>
      <body className="min-h-screen">
        <LocaleProvider defaultLocale={defaultLocale}>
          <ExplorerProvider>
            <Nav />
            <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-6">
              {children}
            </main>
            <Footer />
          </ExplorerProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
