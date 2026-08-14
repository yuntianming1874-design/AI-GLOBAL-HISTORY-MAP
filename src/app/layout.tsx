import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import { ExplorerProvider } from "@/components/history/ExplorerProvider";
import { LocaleProvider } from "@/components/history/LocaleProvider";

export const metadata: Metadata = {
  title: "AI Global History Map — Tang Era World Atlas",
  description:
    "Explore world history through an interactive timeline, historical map, person relationship graph and AI assistant — Tang Dynasty period (618–907) and its contemporaries worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <LocaleProvider>
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
