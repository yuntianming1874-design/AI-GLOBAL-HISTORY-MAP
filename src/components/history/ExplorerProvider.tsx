"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CONTEXT_PARAMS,
  hasUnknownParams,
  hrefWithContext,
  paramsToContext,
  sanitizeContextParams,
  type HistoryContext,
  type HistoryExplorerState,
  type HistoryNavigationAction,
} from "@/lib/explorer";

/**
 * V0.2 global exploration state.
 *
 * The URL search params are the single source of truth:
 *   ?year=751&civ=c-tang&event=e-751-talas&person=p-li-bai&loc=loc-changan
 * Any module can read the current HistoryContext, and every navigation
 * goes through the unified `dispatchHistoryAction` / setter API below.
 */

export interface ExplorerContextValue extends HistoryExplorerState {
  /** Unified navigation entry point used by every module. */
  dispatch(action: HistoryNavigationAction): void;
}

const ExplorerContext = createContext<ExplorerContextValue | null>(null);

function ProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const context = useMemo<HistoryContext>(
    () => paramsToContext(searchParams),
    [searchParams],
  );

  /* whitelist guard: strip unknown/invalid params from the URL once */
  useEffect(() => {
    if (!hasUnknownParams(searchParams)) return;
    const qs = sanitizeContextParams(searchParams).toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [searchParams, pathname, router]);

  /**
   * Write a partial context patch into the URL.
   * V0.2+: defaults to `push` so every exploration step lands in the
   * browser history (back/forward semantics); `replace` is reserved for
   * internal syncing.
   */
  const patch = useCallback(
    (patchValue: Partial<HistoryContext>, opts?: { replace?: boolean }) => {
      const href = hrefWithContext(pathname, searchParams, patchValue);
      if (opts?.replace) router.replace(href);
      else router.push(href);
    },
    [pathname, router, searchParams],
  );

  const value = useMemo<ExplorerContextValue>(
    () => ({
      context,
      setYear: (year) => patch({ year }),
      setYearRange: (start, end) => patch({ startYear: start, endYear: end }),
      selectCivilization: (id) => patch({ civilizationId: id }),
      selectEvent: (id) => patch({ eventId: id }),
      selectPerson: (id) => patch({ personId: id }),
      selectLocation: (id) => patch({ locationId: id }),
      clearHistoryContext: () =>
        patch({
          year: null,
          startYear: null,
          endYear: null,
          civilizationId: null,
          eventId: null,
          personId: null,
          locationId: null,
        }),
      dispatch: (action) => {
        switch (action.type) {
          case "OPEN_EVENT":
            router.push(`/events/${action.id}`);
            break;
          case "OPEN_PERSON":
            router.push(`/people?person=${encodeURIComponent(action.id)}`);
            break;
          case "OPEN_LOCATION":
            patch({ locationId: action.id });
            break;
          case "SET_YEAR":
            router.push(hrefWithContext("/", searchParams, { year: action.year }));
            break;
          case "FOCUS_CIVILIZATION":
            patch({ civilizationId: action.id });
            break;
          case "FOCUS_TIMELINE": {
            const target = hrefWithContext("/", searchParams, {
              year: action.year ?? null,
              startYear: action.startYear ?? null,
              endYear: action.endYear ?? null,
              eventId:
                action.entityType === "event" && action.entityId
                  ? action.entityId
                  : null,
              personId:
                action.entityType === "person" && action.entityId
                  ? action.entityId
                  : null,
            });
            router.push(target);
            break;
          }
          case "FOCUS_MAP":
            router.push(
              `/map?loc=${encodeURIComponent(action.locationId)}` +
                (action.eventId ? `&event=${encodeURIComponent(action.eventId)}` : "") +
                (action.year ? `&year=${action.year}` : ""),
            );
            break;
          case "FOCUS_PERSON_GRAPH":
            router.push(`/people?person=${encodeURIComponent(action.personId)}`);
            break;
        }
      },
    }),
    [context, patch, router, searchParams],
  );

  return <ExplorerContext.Provider value={value}>{children}</ExplorerContext.Provider>;
}

export function ExplorerProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ProviderInner>{children}</ProviderInner>
    </Suspense>
  );
}

export function useExplorer(): ExplorerContextValue {
  const value = useContext(ExplorerContext);
  if (!value) {
    throw new Error("useExplorer must be used within <ExplorerProvider>");
  }
  return value;
}

export function useHistoryContext(): HistoryContext {
  return useExplorer().context;
}

/** Remap a context key to its URL param name (for ad-hoc reads). */
export function contextParamName(key: keyof HistoryContext): string {
  return CONTEXT_PARAMS[key];
}
