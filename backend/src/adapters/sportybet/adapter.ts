import type { BookmakerAdapter } from "@booking-code-converter/shared";
import type { SportyBetAdapterConfig } from "./types.js";

export class SportyBetAdapter implements BookmakerAdapter {
  readonly bookmakerId = "sportybet" as const;

  constructor(private readonly config: SportyBetAdapterConfig) {}

  getCapabilities() {
    return {
      canResolveBookingCode: "unverified" as const,
      canLoadSelections: "unverified" as const,
      canFindEvents: "unverified" as const,
      canFindMarkets: "unverified" as const,
      canValidateSelections: "unverified" as const,
      canCreateBookingCode: "unverified" as const,
    };
  }

  async resolveBookingCode(): Promise<never> {
    throw new Error("SportyBetAdapter.resolveBookingCode: UNVERIFIED — not implemented");
  }

  async loadSelections(): Promise<never> {
    throw new Error("SportyBetAdapter.loadSelections: UNVERIFIED — not implemented");
  }

  async findEvents(): Promise<never> {
    throw new Error("SportyBetAdapter.findEvents: UNVERIFIED — not implemented");
  }

  async findMarkets(): Promise<never> {
    throw new Error("SportyBetAdapter.findMarkets: UNVERIFIED — not implemented");
  }

  async validateSelections(): Promise<never> {
    throw new Error("SportyBetAdapter.validateSelections: UNVERIFIED — not implemented");
  }

  async createBookingCode(): Promise<never> {
    throw new Error("SportyBetAdapter.createBookingCode: UNVERIFIED — not implemented");
  }
}
