import { describe, it, expect } from "vitest";
import {
  INTEGRATION_STATUS_LABELS,
  isOperationAllowed,
  type IntegrationStatus,
} from "@booking-code-converter/shared";

describe("IntegrationStatus", () => {
  it("defines all five status values", () => {
    const statuses: IntegrationStatus[] = [
      "unverified",
      "researching",
      "verified",
      "partially_supported",
      "unsupported",
    ];

    for (const status of statuses) {
      expect(INTEGRATION_STATUS_LABELS[status]).toBeDefined();
      expect(typeof INTEGRATION_STATUS_LABELS[status]).toBe("string");
    }
  });

  it("allows operations only for verified and partially_supported", () => {
    expect(isOperationAllowed("verified")).toBe(true);
    expect(isOperationAllowed("partially_supported")).toBe(true);
    expect(isOperationAllowed("unverified")).toBe(false);
    expect(isOperationAllowed("researching")).toBe(false);
    expect(isOperationAllowed("unsupported")).toBe(false);
  });

  it("distinguishes unverified from unsupported", () => {
    expect(isOperationAllowed("unverified")).toBe(false);
    expect(isOperationAllowed("unsupported")).toBe(false);
    expect(INTEGRATION_STATUS_LABELS.unverified).toContain("not investigated");
    expect(INTEGRATION_STATUS_LABELS.unsupported).toContain("does not support");
  });
});
