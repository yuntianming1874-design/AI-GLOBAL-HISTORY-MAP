"use client";

import { useLocale } from "@/components/history/LocaleProvider";

export function Footer() {
  const { t } = useLocale();
  return (
    <footer className="border-t border-parchment-300 bg-parchment-50/60 py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 text-center text-xs text-ink-faint sm:px-6">
        <p>{t("footer.line1")}</p>
        <p>{t("footer.tech")}</p>
      </div>
    </footer>
  );
}
