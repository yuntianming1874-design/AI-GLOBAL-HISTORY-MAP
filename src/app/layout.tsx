import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import { ExplorerProvider } from "@/components/history/ExplorerProvider";
import { LocaleProvider } from "@/components/history/LocaleProvider";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const accept = headers().get("accept-language") ?? "";
  const isZh = /\bzh(?:-|\b|$)/i.test(accept);
  return {
    title: isZh
      ? "AI 全球历史地图 — 唐时代世界图集"
      : "AI Global History Map — Tang Era World Atlas",
    description: isZh
      ? "通过交互式时间轴、历史地图、人物关系图谱与 AI 助手探索世界历史——唐朝时期（618–907）及其世界同时代。"
      : "Explore world history through an interactive timeline, historical map, person relationship graph and AI assistant — Tang Dynasty period (618–907) and its contemporaries worldwide.",
  };
}

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
