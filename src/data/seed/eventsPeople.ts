import type { EventParticipantRole, HistoricalEvent } from "../../lib/types";

/**
 * events_people join — the single normalized source for "who was involved
 * in which event, in what role". Built from the seed events (participants
 * array + optional explicit participantRoles); the Postgres path stores and
 * queries the same shape in the `events_people` table.
 */
export interface EventsPeopleRow {
  eventId: string;
  personId: string;
  role: EventParticipantRole;
}

export function buildEventsPeople(events: HistoricalEvent[]): EventsPeopleRow[] {
  const rows: EventsPeopleRow[] = [];
  for (const e of events) {
    for (const personId of e.participants) {
      rows.push({
        eventId: e.id,
        personId,
        role: e.participantRoles?.[personId] ?? "participant",
      });
    }
  }
  return rows;
}
