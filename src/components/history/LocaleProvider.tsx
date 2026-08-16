"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  detectLocale,
  LOCALE_STORAGE_KEY,
  t as translateKey,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n";

/**
 * Locale provider — English / 中文.
 * Persisted in localStorage, overridable via ?lang=en|zh (whitelisted param).
 */

export interface LocaleContextValue {
  locale: Locale;
  setLocale(locale: Locale): void;
  /** Translate a dictionary key with optional {vars}. */
  t(key: TranslationKey, vars?: Record<string, string | number>): string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function ProviderInner({
  children,
  defaultLocale,
}: {
  children: React.ReactNode;
  /** Server-detected browser language (Accept-Language) — lowest priority. */
  defaultLocale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Deterministic initial state from the URL (available on server + client
  // for dynamic pages → SSR renders the right locale without mismatch);
  // localStorage persistence is merged in after mount.
  const [locale, setLocaleState] = useState<Locale>(() =>
    detectLocale(searchParams?.get("lang") ?? null, null, defaultLocale),
  );

  /* merge persisted locale after hydration (URL param wins) */
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    const resolved = detectLocale(
      searchParams?.get("lang") ?? null,
      stored,
      defaultLocale,
    );
    setLocaleState(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* keep <html lang> in sync */
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      } catch {
        /* storage unavailable — locale still applies for the session */
      }
      // reflect in the URL so it survives navigation & is shareable
      const params = new URLSearchParams(searchParams.toString());
      params.set("lang", next);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: (key, vars) => translateKey(locale, key, vars) }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function LocaleProvider({
  children,
  defaultLocale = "en",
}: {
  children: React.ReactNode;
  defaultLocale?: Locale;
}) {
  return (
    <Suspense fallback={null}>
      <ProviderInner defaultLocale={defaultLocale}>{children}</ProviderInner>
    </Suspense>
  );
}


export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used within <LocaleProvider>");
  return value;
}
