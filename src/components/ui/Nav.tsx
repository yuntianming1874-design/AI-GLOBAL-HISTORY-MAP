"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { useLocale } from "@/components/history/LocaleProvider";
import type { Locale } from "@/lib/i18n";

const LINKS = [
  { href: "/", labelKey: "nav.overview" as const, icon: "globe" as const },
  { href: "/map", labelKey: "nav.map" as const, icon: "map" as const },
  { href: "/people", labelKey: "nav.people" as const, icon: "users" as const },
  { href: "/chat", labelKey: "nav.chat" as const, icon: "bot" as const },
];

export function Nav() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-parchment-300 bg-parchment-100/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label={t("nav.brand")}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-vermilion text-parchment-50 shadow-card transition group-hover:bg-vermilion-dark">
            <Icon name="globe" className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-bold tracking-tight text-ink">
              {t("nav.brand")}
            </span>
            <span className="block text-[11px] font-medium tracking-wide text-ink-faint">
              {t("nav.tagline")}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav
            aria-label="Primary"
            className="flex items-center gap-1 overflow-x-auto rounded-lg border border-parchment-300 bg-parchment-50 p-1"
          >
            {LINKS.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition " +
                    (active
                      ? "bg-vermilion text-white shadow-sm"
                      : "text-ink-soft hover:bg-parchment-200 hover:text-ink")
                  }
                >
                  <Icon name={link.icon} className="h-4 w-4" />
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* language toggle: English / 中文 */}
          <div
            className="flex shrink-0 items-center rounded-lg border border-parchment-300 bg-parchment-50 p-0.5"
            role="group"
            aria-label="Language"
          >
            {(["en", "zh"] as Locale[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                aria-pressed={locale === lang}
                className={
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition " +
                  (locale === lang
                    ? "bg-ink text-parchment-50 shadow-sm"
                    : "text-ink-soft hover:bg-parchment-200 hover:text-ink")
                }
              >
                {lang === "en" ? "EN" : "中文"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
