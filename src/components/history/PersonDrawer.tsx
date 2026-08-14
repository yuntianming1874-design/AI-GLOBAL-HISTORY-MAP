"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type {
  EventDTO,
  HistoricalLocation,
  PersonDTO,
  RelationshipDTO,
} from "@/lib/types";
import { RELATIONSHIP_META } from "@/lib/theme";
import { formatHistoricalDate, formatLifespan } from "@/lib/provenance";
import { computeContemporaries } from "@/lib/contemporaries";
import type { TranslationKey } from "@/lib/i18n";
import { zhPersonRoles } from "@/data/seed/zhPeopleRelationships";
import { Icon } from "@/components/ui/icons";
import { useExplorer } from "./ExplorerProvider";
import { useLocale } from "./LocaleProvider";

/**
 * Person Detail Drawer (V0.2) — biography, important events,
 * relationships, activity locations, contemporaries, and navigation
 * actions (View on Timeline / View on Map / Ask AI).
 */
export function PersonDrawer({
  person,
  relationships,
  eventsByPerson,
  allEvents,
  locations,
  people,
  onClose,
  onSelectPerson,
}: {
  person: PersonDTO | null;
  relationships: RelationshipDTO[];
  eventsByPerson: EventDTO[] | null;
  allEvents: EventDTO[];
  locations: HistoricalLocation[];
  people: PersonDTO[];
  onClose: () => void;
  onSelectPerson: (id: string) => void;
}) {
  const { dispatch } = useExplorer();
  const router = useRouter();
  const { locale, t } = useLocale();
  const zh = (en: string, alt: string | null | undefined) => (locale === "zh" && alt ? alt : en);

  const personRels = useMemo(
    () =>
      person
        ? relationships.filter(
            (r) => r.sourcePersonId === person.id || r.targetPersonId === person.id,
          )
        : [],
    [person, relationships],
  );

  const activityLocations = useMemo(() => {
    if (!person) return [];
    const seen = new Set<string>();
    const out: { locationId: string; name: string; event: string }[] = [];
    for (const e of eventsByPerson ?? []) {
      if (e.locationId && !seen.has(e.locationId)) {
        seen.add(e.locationId);
        out.push({
          locationId: e.locationId,
          name: e.locationName ?? e.locationId,
          event: e.title,
        });
      }
    }
    if (person.civilizationId) {
      const seat = locations.find((l) => l.civilizationId === person.civilizationId);
      if (seat && !seen.has(seat.id)) {
        out.push({
          locationId: seat.id,
          name: seat.name,
          event: t("dr.seatOf", { civ: person.civilizationName ?? "—" }),
        });
      }
    }
    return out;
  }, [person, eventsByPerson, locations, t]);

  const contemporaries = useMemo(
    () => (person ? computeContemporaries(person.id, people, allEvents) : []),
    [person, people, allEvents],
  );

  /** Events shared with each relationship partner (collapsible groups). */
  const sharedEvents = useMemo(() => {
    if (!person) return [];
    return personRels
      .map((r) => {
        const otherId = r.sourcePersonId === person.id ? r.targetPersonId : r.sourcePersonId;
        const otherName =
          r.sourcePersonId === person.id ? r.targetName : r.sourceName;
        const shared = allEvents.filter(
          (e) => e.participants.includes(person.id) && e.participants.includes(otherId),
        );
        return { otherId, otherName, shared };
      })
      .filter((g) => g.shared.length > 0)
      .sort((a, b) => b.shared.length - a.shared.length);
  }, [person, personRels, allEvents]);

  if (!person) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${person.name} profile`}
    >
      <aside
        className="h-full w-full max-w-md overflow-y-auto bg-parchment-50 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <header className="sticky top-0 z-10 border-b border-parchment-200 bg-parchment-50/95 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: person.civilizationColor ?? "#8a7a66" }}
                  aria-hidden="true"
                />
                {person.name}
              </h3>
              <p className="mt-0.5 text-xs text-ink-faint">
                {person.chineseName} · {locale === "zh" ? (zhPersonRoles[person.id] ?? person.role) : person.role}
                {person.civilizationName ? ` · ${person.civilizationName}` : ""}
              </p>
              {person.provenance?.roles && person.provenance.roles.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {person.provenance.roles.map((r, i) => (
                    <li key={i} className="text-[11px] leading-snug text-ink-faint">
                      <span className="font-semibold text-ink-soft">
                        {locale === "zh"
                          ? (r.role.split(" ").find((tk) => /[\u4e00-\u9fff]/.test(tk)) ?? r.role)
                          : r.role}
                      </span>
                      {" · "}
                      {formatHistoricalDate(r.validFrom, locale)}
                      {r.validTo ? `–${formatHistoricalDate(r.validTo, locale)}` : ""}
                      {r.confidence === "disputed" ? ` (${locale === "zh" ? "存在学术争议" : "disputed"})` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label={t("dr.close")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-parchment-100 text-ink-soft transition hover:bg-parchment-200"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 font-mono text-xs text-ink-faint">
            {formatLifespan(person.provenance?.birth, person.provenance?.death, locale)}{" "}
            ·{" "}
            <span className="text-gold-dark">
              {"★".repeat(person.importance)}
              {"☆".repeat(5 - person.importance)}
            </span>
          </p>
        </header>

        <div className="space-y-5 px-5 py-4">
          {/* biography */}
          <section>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <Icon name="book" className="h-3.5 w-3.5" /> {t("dr.biography")}
            </h4>
            <p className="text-sm leading-relaxed text-ink-soft">{zh(person.summary, person.zhSummary)}</p>
          </section>

          {/* important events */}
          <section>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <Icon name="calendar" className="h-3.5 w-3.5" /> {t("dr.importantEvents")}
            </h4>
            {eventsByPerson === null ? (
              <p className="text-xs text-ink-faint">{t("common.loading")}</p>
            ) : eventsByPerson.length === 0 ? (
              <p className="text-xs text-ink-faint">{t("dr.noEvents")}</p>
            ) : (
              <ul className="space-y-1.5">
                {eventsByPerson.map((e) => (
                  <li key={e.id}>
                    <button
                      onClick={() => dispatch({ type: "OPEN_EVENT", id: e.id })}
                      className="flex w-full items-baseline gap-2 rounded-lg border border-parchment-200 bg-parchment-100/50 px-2.5 py-1.5 text-left transition hover:border-gold"
                    >
                      <span className="shrink-0 font-mono text-xs text-ink-faint">{e.year}</span>
                      <span className="text-sm font-semibold text-ink hover:text-vermilion-dark">
                        {zh(e.title, e.chineseTitle)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* relationships */}
          <section>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <Icon name="users" className="h-3.5 w-3.5" /> {t("dr.relationships")} · {personRels.length}
            </h4>
            <ul className="space-y-2">
              {personRels.map((r) => {
                const otherRow =
                  r.sourcePersonId === person.id
                    ? { id: r.targetPersonId, name: r.targetName, pid: r.targetPersonId }
                    : { id: r.sourcePersonId, name: r.sourceName, pid: r.sourcePersonId };
                const otherPerson = people.find((p) => p.id === otherRow.pid);
                const other = {
                  id: otherRow.id,
                  name: otherPerson ? zh(otherRow.name, otherPerson.chineseName) : otherRow.name,
                };
                return (
                  <li
                    key={r.id}
                    className="rounded-lg border border-parchment-200 bg-parchment-100/50 p-2.5"
                  >
                    <button
                      onClick={() => onSelectPerson(other.id)}
                      className="flex items-center gap-1.5 text-sm font-semibold text-ink transition hover:text-vermilion-dark"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: RELATIONSHIP_META[r.type].color }}
                      />
                      {other.name}
                      <span className="text-xs font-medium text-ink-faint">
                        ({t(("rel." + r.type) as TranslationKey)})
                      </span>
                    </button>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">{zh(r.description, r.zhDescription)}</p>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* locations */}
          <section>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <Icon name="map" className="h-3.5 w-3.5" /> {t("dr.locations")}
            </h4>
            {activityLocations.length === 0 ? (
              <p className="text-xs text-ink-faint">{t("dr.noLocations")}</p>
            ) : (
              <ul className="space-y-1.5">
                {activityLocations.map((l) => (
                  <li key={l.locationId}>
                    <button
                      onClick={() => dispatch({ type: "OPEN_LOCATION", id: l.locationId })}
                      className="flex w-full items-baseline justify-between gap-2 rounded-lg border border-parchment-200 bg-parchment-100/50 px-2.5 py-1.5 text-left transition hover:border-gold"
                    >
                      <span className="text-sm font-semibold text-ink hover:text-vermilion-dark">
                        {l.name}
                      </span>
                      <span className="truncate pl-2 text-[11px] text-ink-faint">{l.event}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* shared events (collapsible per partner) */}
          <section>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <Icon name="users" className="h-3.5 w-3.5" /> {t("dr.sharedEvents")} · {sharedEvents.length}
            </h4>
            {sharedEvents.length === 0 ? (
              <p className="text-xs text-ink-faint">{t("dr.sharedNone")}</p>
            ) : (
              <div className="space-y-1.5">
                {sharedEvents.slice(0, 6).map((g) => (
                  <details
                    key={g.otherId}
                    className="group rounded-lg border border-parchment-200 bg-parchment-100/50 p-2.5 open:bg-gold/5"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-ink">
                      <Icon
                        name="chevron-down"
                        className="h-3.5 w-3.5 text-ink-faint transition group-open:rotate-180"
                      />
                      {t("dr.with", { name: zh(g.otherName, people.find((p) => p.id === g.otherId)?.chineseName ?? null) })}
                      <span className="ml-auto text-xs font-medium text-ink-faint">
                        {g.shared.length === 1
                          ? t("dr.eventUnit", { n: g.shared.length })
                          : t("dr.eventsUnit", { n: g.shared.length })}
                      </span>
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {g.shared.map((e) => (
                        <li key={e.id}>
                          <button
                            onClick={() => dispatch({ type: "OPEN_EVENT", id: e.id })}
                            className="flex w-full items-baseline gap-2 rounded-md px-2 py-1 text-left text-xs transition hover:bg-gold/15"
                          >
                            <span className="shrink-0 font-mono text-ink-faint">{e.year}</span>
                            <span className="font-semibold text-ink hover:text-vermilion-dark">
                              {e.title}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            )}
          </section>

          {/* contemporaries */}
          <section>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <Icon name="clock" className="h-3.5 w-3.5" /> {t("dr.contemporaries")} · {contemporaries.length}
            </h4>
            {contemporaries.length === 0 ? (
              <p className="text-xs text-ink-faint">{t("dr.contemporariesNote")}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {contemporaries.slice(0, 12).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectPerson(c.id)}
                    className="chip transition hover:border-gold"
                    title={`${c.role} · ${formatLifespan(c.provenance?.birth, c.provenance?.death, locale)}`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: c.civilizationColor ?? "#8a7a66" }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* actions */}
          <section className="sticky bottom-0 -mx-5 border-t border-parchment-200 bg-parchment-50/95 px-5 py-3 backdrop-blur">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  router.push(
                    person.birthYear !== null && person.deathYear !== null
                      ? `/?person=${encodeURIComponent(person.id)}&start=${person.birthYear}&end=${person.deathYear}`
                      : `/?person=${encodeURIComponent(person.id)}&year=${person.birthYear ?? ""}`,
                  )
                }
                className="btn-primary !px-3 !py-1.5 text-xs"
              >
                <Icon name="calendar" className="h-3.5 w-3.5" /> {t("dr.viewTimeline")}
              </button>
              <button
                onClick={() =>
                  router.push(`/map?person=${encodeURIComponent(person.id)}`)
                }
                className="btn-ghost !px-3 !py-1.5 text-xs"
              >
                <Icon name="map" className="h-3.5 w-3.5" /> {t("dr.viewMap")}
              </button>
              <button
                onClick={() =>
                  router.push(`/chat?person=${encodeURIComponent(person.id)}`)
                }
                className="btn-ghost !px-3 !py-1.5 text-xs"
              >
                <Icon name="bot" className="h-3.5 w-3.5" /> {t("dr.askAI")}
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
