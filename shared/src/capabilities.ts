import type { IntegrationStatus } from "./integration-status.js";

export type CapabilityStatus = IntegrationStatus;

export interface BookingCodeCapabilities {
  canResolveBookingCode: CapabilityStatus;
  canLoadSelections: CapabilityStatus;
  canFindEvents: CapabilityStatus;
  canFindMarkets: CapabilityStatus;
  canValidateSelections: CapabilityStatus;
  canCreateBookingCode: CapabilityStatus;
}

export const UNVERIFIED_CAPABILITIES: BookingCodeCapabilities = {
  canResolveBookingCode: "unverified",
  canLoadSelections: "unverified",
  canFindEvents: "unverified",
  canFindMarkets: "unverified",
  canValidateSelections: "unverified",
  canCreateBookingCode: "unverified",
};

export function isCapabilityAvailable(
  status: CapabilityStatus,
): boolean {
  return status === "verified" || status === "partially_supported";
}

export function isCapabilityUnsupported(
  status: CapabilityStatus,
): boolean {
  return status === "unsupported";
}

export type CapabilityKey = keyof BookingCodeCapabilities;

export const CAPABILITY_KEYS: CapabilityKey[] = [
  "canResolveBookingCode",
  "canLoadSelections",
  "canFindEvents",
  "canFindMarkets",
  "canValidateSelections",
  "canCreateBookingCode",
];

export const CAPABILITY_LABELS: Record<CapabilityKey, string> = {
  canResolveBookingCode: "Resolve booking code",
  canLoadSelections: "Load selections",
  canFindEvents: "Find events",
  canFindMarkets: "Find markets",
  canValidateSelections: "Validate selections",
  canCreateBookingCode: "Create booking code",
};
