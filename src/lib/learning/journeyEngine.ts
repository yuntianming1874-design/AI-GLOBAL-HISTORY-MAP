/**
 * V0.3 — Journey engine: step progression + single-transition context patch.
 *
 * A step transition must produce ONE complete HistoryContext patch
 * (journey + step + year/start/end/event/person/civ/loc), so the URL is
 * updated in a single router.push — never several sequential updates.
 */
import type { Journey, JourneyStep } from "./journeyTypes";
import type { HistoryContext } from "../explorer";
import { getJourneyStep } from "./journeyRepository";

/** Full context patch for entering a step (every key explicit). */
export function stepContextPatch(
  journey: Journey,
  step: JourneyStep,
): Partial<HistoryContext> {
  return {
    journeyId: journey.id,
    journeyStep: step.order,
    year: step.year ?? null,
    startYear: step.startYear ?? null,
    endYear: step.endYear ?? null,
    eventId: step.eventId ?? null,
    personId: step.personId ?? null,
    civilizationId: step.civilizationId ?? null,
    locationId: step.locationId ?? null,
  };
}

/** Context patch for entering the first step (START_JOURNEY). */
export function startJourneyPatch(journey: Journey): Partial<HistoryContext> | null {
  const first = getJourneyStep(journey, 1);
  if (!first) return null;
  return stepContextPatch(journey, first);
}

/** Context patch for a specific step (SET_JOURNEY_STEP). */
export function journeyStepPatch(
  journey: Journey,
  stepNumber: number,
): Partial<HistoryContext> | null {
  const step = getJourneyStep(journey, stepNumber);
  if (!step) return null;
  return stepContextPatch(journey, step);
}

export function nextStep(
  journey: Journey,
  currentStep: number,
): number | null {
  return currentStep < journey.steps.length ? currentStep + 1 : null;
}

export function prevStep(_journey: Journey, currentStep: number): number | null {
  return currentStep > 1 ? currentStep - 1 : null;
}
