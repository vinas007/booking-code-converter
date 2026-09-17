import type { Selection } from "@booking-code-converter/shared";

export function getSelectionEventId(selection: Selection): string | undefined {
  const [eventId] = selection.id.split(":");
  return eventId || undefined;
}
